import type { AuthSession, AuthSessionResponse, LoginPayload, ModuleCode, RegisterPayload } from '@/types/auth'
import type { TenantProfile } from '@/types/tenant'
import { computed, reactive } from 'vue'
import { authApi, saasApi, tenantApi } from '@/services/api'
import { ApiError } from '@/services/http'

const STORAGE_KEY = 'mov-flow.session.v1'
const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou. Faça login novamente.'

interface SessionState {
  initialized: boolean
  initializing: boolean
  session: AuthSession | null
  tenant: TenantProfile | null
  enabledModules: ModuleCode[]
  bootstrapError: string | null
}

interface PersistedSessionSnapshot {
  session: AuthSession
  tenant: TenantProfile | null
  enabledModules: ModuleCode[]
}

const state = reactive<SessionState>({
  initialized: false,
  initializing: false,
  session: null,
  tenant: null,
  enabledModules: [],
  bootstrapError: null,
})

let initializePromise: Promise<void> | null = null

function normalizeModules (modules: string[]): ModuleCode[] {
  const validModules = new Set<ModuleCode>(['logistics', 'fleet', 'financial'])
  const unique = [...new Set(modules)]
    .filter((moduleCode): moduleCode is ModuleCode => validModules.has(moduleCode as ModuleCode))

  return unique
}

function isSessionExpired (session: AuthSession): boolean {
  return Date.now() >= session.expiresAt
}

function persistState () {
  if (!state.session) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }

  const payload: PersistedSessionSnapshot = {
    session: state.session,
    tenant: state.tenant,
    enabledModules: state.enabledModules,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

function hydrateStateFromStorage () {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedSessionSnapshot>

    if (!parsed.session?.accessToken) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    state.session = parsed.session
    state.tenant = parsed.tenant ?? null
    state.enabledModules = normalizeModules(parsed.enabledModules ?? [])
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function applyAuthSession (payload: AuthSessionResponse) {
  state.session = {
    accessToken: payload.accessToken,
    tokenType: payload.tokenType,
    expiresIn: payload.expiresIn,
    expiresAt: Date.now() + payload.expiresIn * 1000,
    user: payload.user,
  }

  state.bootstrapError = null
  persistState()
}

function resetSessionState () {
  state.session = null
  state.tenant = null
  state.enabledModules = []
  state.bootstrapError = null
  localStorage.removeItem(STORAGE_KEY)
}

async function refreshSessionContext () {
  if (!state.session) {
    return
  }

  const [meResult, tenantResult, modulesResult] = await Promise.allSettled([
    authApi.me(),
    tenantApi.getMe(),
    saasApi.listEnabledModules(),
  ])

  if (meResult.status === 'rejected') {
    const reason = meResult.reason

    if (reason instanceof ApiError && reason.status === 401) {
      throw reason
    }

    state.bootstrapError
      = reason instanceof Error ? reason.message : 'Falha ao atualizar perfil autenticado.'
  } else if (state.session) {
    state.session.user = meResult.value
  }

  state.tenant = tenantResult.status === 'fulfilled' ? tenantResult.value : state.tenant ?? null

  if (modulesResult.status === 'fulfilled') {
    state.enabledModules = normalizeModules(modulesResult.value)
  } else {
    const reason = modulesResult.reason
    if (!(reason instanceof ApiError && reason.status === 403)) {
      state.bootstrapError
        = reason instanceof Error ? reason.message : 'Falha ao carregar modulos habilitados.'
    }
  }

  persistState()
}

const isAuthenticated = computed(() => {
  if (!state.session) {
    return false
  }
  return !isSessionExpired(state.session)
})

const accessToken = computed(() => {
  if (!isAuthenticated.value || !state.session) {
    return null
  }
  return state.session.accessToken
})

function getPermissions (): string[] {
  return state.session?.user.permissions ?? []
}

function hasPermission (permission: string): boolean {
  return getPermissions().includes(permission)
}

function hasAllPermissions (required: string[]): boolean {
  if (required.length === 0) {
    return true
  }
  return required.every(permission => hasPermission(permission))
}

function hasAnyPermission (required: string[]): boolean {
  if (required.length === 0) {
    return true
  }
  return required.some(permission => hasPermission(permission))
}

function hasModule (moduleCode: ModuleCode): boolean {
  return state.enabledModules.includes(moduleCode)
}

function hasAllModules (required: ModuleCode[]): boolean {
  if (required.length === 0) {
    return true
  }
  return required.every(moduleCode => hasModule(moduleCode))
}

function hasAnyModule (required: ModuleCode[]): boolean {
  if (required.length === 0) {
    return true
  }
  return required.some(moduleCode => hasModule(moduleCode))
}

async function initialize () {
  if (state.initialized) {
    return
  }
  if (initializePromise) {
    return initializePromise
  }

  initializePromise = (async () => {
    state.initializing = true
    hydrateStateFromStorage()

    if (!state.session) {
      state.initialized = true
      state.initializing = false
      return
    }

    if (isSessionExpired(state.session)) {
      resetSessionState()
      state.bootstrapError = SESSION_EXPIRED_MESSAGE
      state.initialized = true
      state.initializing = false
      return
    }

    try {
      await refreshSessionContext()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        resetSessionState()
        state.bootstrapError = SESSION_EXPIRED_MESSAGE
      } else {
        state.bootstrapError = error instanceof Error ? error.message : 'Falha ao iniciar sessao.'
      }
    } finally {
      state.initialized = true
      state.initializing = false
    }
  })().finally(() => {
    initializePromise = null
  })

  return initializePromise
}

async function login (payload: LoginPayload) {
  const response = await authApi.login(payload)
  applyAuthSession(response)
  await refreshSessionContext()
}

async function register (payload: RegisterPayload) {
  const response = await authApi.register(payload)
  applyAuthSession(response)
  await refreshSessionContext()
}

function logout () {
  resetSessionState()
}

function handleUnauthorized () {
  resetSessionState()
  state.bootstrapError = SESSION_EXPIRED_MESSAGE
}

export function useSessionStore () {
  return {
    state,
    isAuthenticated,
    accessToken,
    initialize,
    login,
    register,
    logout,
    handleUnauthorized,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasModule,
    hasAllModules,
    hasAnyModule,
  }
}
