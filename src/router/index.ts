import type { ModuleCode } from '@/types/auth'
import { createRouter, createWebHistory, type RouteLocationNormalized, type RouteRecordRaw } from 'vue-router'
import { useSessionStore } from '@/stores/session'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    guestOnly?: boolean
    requiresAuth?: boolean
    permissionsAny?: string[]
    permissionsAll?: string[]
    modulesAny?: ModuleCode[]
    modulesAll?: ModuleCode[]
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/app/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/public/LoginPage.vue'),
    meta: {
      title: 'Entrar',
      guestOnly: true,
    },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/public/RegisterPage.vue'),
    meta: {
      title: 'Criar Tenant',
      guestOnly: true,
    },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/pages/public/ForbiddenPage.vue'),
    meta: {
      title: 'Acesso Negado',
      requiresAuth: true,
    },
  },
  {
    path: '/app',
    component: () => import('@/layouts/AuthenticatedLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        redirect: '/app/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/app/DashboardPage.vue'),
        meta: {
          title: 'Dashboard',
        },
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/pages/app/AdminPage.vue'),
        meta: {
          title: 'Administrativo',
          permissionsAny: [
            'companies.read',
            'users.read',
            'roles.read',
            'permissions.read',
            'settings.read',
            'audit.logs.read',
            'tenants.read',
          ],
        },
      },
      {
        path: 'operations',
        name: 'operations',
        component: () => import('@/pages/app/OperationsPage.vue'),
        meta: {
          title: 'Operações',
          modulesAny: ['fleet', 'logistics'],
          permissionsAny: ['drivers.read', 'vehicles.read', 'orders.read', 'shipments.read'],
        },
      },
      {
        path: 'financial',
        name: 'financial',
        component: () => import('@/pages/app/FinancialPage.vue'),
        meta: {
          title: 'Financeiro',
          modulesAll: ['financial'],
          permissionsAny: ['financial.read', 'financial.master.read', 'financial.reports.read'],
        },
      },
      {
        path: 'billing',
        name: 'billing',
        component: () => import('@/pages/app/BillingPage.vue'),
        meta: {
          title: 'Billing SaaS',
          permissionsAny: ['saas.plans.read', 'saas.subscriptions.read', 'saas.payments.read'],
        },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/pages/app/SettingsPage.vue'),
        meta: {
          title: 'Configurações do Tenant',
          permissionsAll: ['settings.read'],
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/public/NotFoundPage.vue'),
    meta: {
      title: 'Página não encontrada',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

function missingPermission (
  route: RouteLocationNormalized,
  hasPermission: (permission: string) => boolean,
): string | null {
  const permissionsAll = route.meta.permissionsAll ?? []
  const permissionsAny = route.meta.permissionsAny ?? []

  const missingRequired = permissionsAll.find(permission => !hasPermission(permission))
  if (missingRequired) {
    return missingRequired
  }

  if (permissionsAny.length > 0 && !permissionsAny.some(permission => hasPermission(permission))) {
    return permissionsAny[0] ?? null
  }

  return null
}

function missingModule (
  route: RouteLocationNormalized,
  hasModule: (moduleCode: ModuleCode) => boolean,
): ModuleCode | null {
  const modulesAll = route.meta.modulesAll ?? []
  const modulesAny = route.meta.modulesAny ?? []

  const missingRequired = modulesAll.find(moduleCode => !hasModule(moduleCode))
  if (missingRequired) {
    return missingRequired
  }

  if (modulesAny.length > 0 && !modulesAny.some(moduleCode => hasModule(moduleCode))) {
    return modulesAny[0] ?? null
  }

  return null
}

router.beforeEach(async to => {
  const session = useSessionStore()
  await session.initialize()

  if (to.meta.guestOnly && session.isAuthenticated.value) {
    return { path: '/app/dashboard' }
  }

  if (to.meta.requiresAuth && !session.isAuthenticated.value) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  const unauthorizedPermission = missingPermission(to, session.hasPermission)
  if (unauthorizedPermission) {
    return {
      name: 'forbidden',
      query: {
        reason: 'permission',
        resource: unauthorizedPermission,
      },
    }
  }

  const unauthorizedModule = missingModule(to, session.hasModule)
  if (unauthorizedModule) {
    return {
      name: 'forbidden',
      query: {
        reason: 'module',
        resource: unauthorizedModule,
      },
    }
  }

  return true
})

router.afterEach(to => {
  const suffix = 'Mov Flow'
  document.title = to.meta.title ? `${to.meta.title} | ${suffix}` : suffix
})

export default router
