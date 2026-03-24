import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  AuthSession,
  AuthSessionResponse,
  LoginPayload,
  ModuleCode,
  RegisterPayload,
  TenantProfile,
} from '@/core/types/auth'
import { ApiError } from '@/core/types/api'
import { apiClient } from '@/core/http/client'

const STORAGE_KEY = 'mov-flow.session.v2'
const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou. Faça login novamente.'

type PersistedSession = {
  session: AuthSession
  tenant: TenantProfile | null
  enabledModules: ModuleCode[]
  modulesLoaded: boolean
}

function normalizeModules(modules: string[]): ModuleCode[] {
  const allowed = new Set<ModuleCode>(['logistics', 'fleet', 'financial'])
  const unique = [...new Set(modules)]
  return unique.filter((moduleCode): moduleCode is ModuleCode =>
    allowed.has(moduleCode as ModuleCode),
  )
}

function toSession(payload: AuthSessionResponse): AuthSession {
  return {
    accessToken: payload.accessToken,
    tokenType: payload.tokenType,
    expiresIn: payload.expiresIn,
    expiresAt: Date.now() + payload.expiresIn * 1000,
    user: payload.user,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const initialized = ref(false)
  const initializing = ref(false)

  const session = ref<AuthSession | null>(null)
  const tenant = ref<TenantProfile | null>(null)
  const enabledModules = ref<ModuleCode[]>([])
  const modulesLoaded = ref(false)
  const bootstrapError = ref<string | null>(null)

  let bootstrapPromise: Promise<void> | null = null

  const isAuthenticated = computed(() => {
    if (!session.value) return false
    return Date.now() < session.value.expiresAt
  })

  const accessToken = computed(() => {
    if (!isAuthenticated.value || !session.value) return null
    return session.value.accessToken
  })

  const permissions = computed(() => session.value?.user.permissions ?? [])

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  function hasAnyPermission(required: string[]): boolean {
    if (required.length === 0) return true
    return required.some((permission) => hasPermission(permission))
  }

  function hasAllPermissions(required: string[]): boolean {
    if (required.length === 0) return true
    return required.every((permission) => hasPermission(permission))
  }

  function hasModule(moduleCode: ModuleCode): boolean {
    if (!modulesLoaded.value) return true
    return enabledModules.value.includes(moduleCode)
  }

  function hasAnyModule(required: ModuleCode[]): boolean {
    if (required.length === 0) return true
    return required.some((moduleCode) => hasModule(moduleCode))
  }

  function hasAllModules(required: ModuleCode[]): boolean {
    if (required.length === 0) return true
    return required.every((moduleCode) => hasModule(moduleCode))
  }

  function clearSession() {
    session.value = null
    tenant.value = null
    enabledModules.value = []
    modulesLoaded.value = false
    localStorage.removeItem(STORAGE_KEY)
  }

  function persistSession() {
    if (!session.value) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    const payload: PersistedSession = {
      session: session.value,
      tenant: tenant.value,
      enabledModules: enabledModules.value,
      modulesLoaded: modulesLoaded.value,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  function hydrateSession() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as Partial<PersistedSession>

      if (!parsed.session?.accessToken) {
        localStorage.removeItem(STORAGE_KEY)
        return
      }

      session.value = parsed.session
      tenant.value = parsed.tenant ?? null
      enabledModules.value = normalizeModules(parsed.enabledModules ?? [])
      modulesLoaded.value = Boolean(parsed.modulesLoaded)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  async function refreshContext() {
    if (!session.value) return

    const [meResult, tenantResult, modulesResult] = await Promise.allSettled([
      apiClient.get<AuthSessionResponse['user']>('/auth/me'),
      apiClient.get<TenantProfile>('/tenants/me'),
      apiClient.get<string[]>('/saas/tenant-modules/enabled'),
    ])

    if (meResult.status === 'fulfilled' && session.value) {
      session.value.user = meResult.value
    }

    if (tenantResult.status === 'fulfilled') {
      tenant.value = tenantResult.value
    }

    if (modulesResult.status === 'fulfilled') {
      enabledModules.value = normalizeModules(modulesResult.value)
      modulesLoaded.value = true
    } else {
      const reason = modulesResult.reason
      if (!(reason instanceof ApiError && reason.status === 403)) {
        bootstrapError.value =
          reason instanceof Error ? reason.message : 'Falha ao carregar módulos habilitados.'
      }
    }

    if (
      meResult.status === 'rejected' &&
      meResult.reason instanceof ApiError &&
      meResult.reason.status === 401
    ) {
      throw meResult.reason
    }

    persistSession()
  }

  async function initialize() {
    if (initialized.value) return
    if (bootstrapPromise) return bootstrapPromise

    bootstrapPromise = (async () => {
      initializing.value = true
      hydrateSession()

      if (!session.value) {
        initialized.value = true
        initializing.value = false
        return
      }

      if (Date.now() >= session.value.expiresAt) {
        clearSession()
        bootstrapError.value = SESSION_EXPIRED_MESSAGE
        initialized.value = true
        initializing.value = false
        return
      }

      try {
        await refreshContext()
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession()
          bootstrapError.value = SESSION_EXPIRED_MESSAGE
        } else {
          bootstrapError.value =
            error instanceof Error ? error.message : 'Falha ao inicializar sessão.'
        }
      } finally {
        initialized.value = true
        initializing.value = false
      }
    })().finally(() => {
      bootstrapPromise = null
    })

    return bootstrapPromise
  }

  async function login(payload: LoginPayload) {
    const response = await apiClient.post<AuthSessionResponse>('/auth/login', payload)
    session.value = toSession(response)
    bootstrapError.value = null
    await refreshContext()
  }

  async function register(payload: RegisterPayload) {
    const response = await apiClient.post<AuthSessionResponse>('/auth/register', payload)
    session.value = toSession(response)
    bootstrapError.value = null
    await refreshContext()
  }

  function logout() {
    clearSession()
  }

  function handleUnauthorized() {
    clearSession()
    bootstrapError.value = SESSION_EXPIRED_MESSAGE
  }

  return {
    initialized,
    initializing,
    session,
    tenant,
    enabledModules,
    modulesLoaded,
    bootstrapError,
    isAuthenticated,
    accessToken,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModule,
    hasAnyModule,
    hasAllModules,
    initialize,
    login,
    register,
    logout,
    handleUnauthorized,
  }
})
