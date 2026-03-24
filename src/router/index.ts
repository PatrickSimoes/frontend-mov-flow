import type { ModuleCode } from '@/core/types/auth'
import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from 'vue-router'
import { reports, resources } from '@/modules/registry/resources'
import { useAuthStore } from '@/stores/auth'

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

function childPathFromAppPath(path: string): string {
  return path.replace(/^\/app\//, '')
}

function routeName(prefix: string, rawPath: string): string {
  const normalized = rawPath.replace(/^\//, '').replace(/\//g, '-').replace(/:/g, '')

  return `${prefix}-${normalized}`
}

const resourceRoutes: RouteRecordRaw[] = resources.map((resource) => ({
  path: childPathFromAppPath(resource.routePath),
  name: routeName('resource', resource.routePath),
  component: () => import('@/pages/app/ResourceCrudPage.vue'),
  props: {
    resourceKey: resource.key,
  },
  meta: {
    title: resource.title,
    requiresAuth: true,
    permissionsAll: [resource.permissions.read],
    modulesAll: resource.moduleAccess ? [resource.moduleAccess] : undefined,
  },
}))

const reportRoutes: RouteRecordRaw[] = reports.map((report) => ({
  path: childPathFromAppPath(report.routePath),
  name: routeName('report', report.routePath),
  component: () => import('@/pages/app/ReportViewPage.vue'),
  props: {
    reportKey: report.key,
  },
  meta: {
    title: report.title,
    requiresAuth: true,
    permissionsAll: [report.permission],
    modulesAll: [report.moduleAccess],
  },
}))

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
          requiresAuth: true,
        },
      },
      {
        path: 'admin/tenant',
        name: 'admin-tenant',
        component: () => import('@/pages/app/TenantPage.vue'),
        meta: {
          title: 'Meu Tenant',
          requiresAuth: true,
          permissionsAll: ['tenants.read'],
        },
      },
      {
        path: 'admin/settings',
        name: 'admin-settings',
        component: () => import('@/pages/app/SettingsPage.vue'),
        meta: {
          title: 'Configurações',
          requiresAuth: true,
          permissionsAll: ['settings.read'],
        },
      },
      {
        path: 'settings',
        redirect: '/app/admin/settings',
      },
      {
        path: 'billing',
        redirect: '/app/billing/plans',
      },
      {
        path: 'billing/plans',
        name: 'billing-plans',
        component: () => import('@/pages/app/billing/BillingPlansPage.vue'),
        meta: {
          title: 'Planos',
          requiresAuth: true,
          permissionsAll: ['saas.plans.read'],
        },
      },
      {
        path: 'billing/subscription',
        name: 'billing-subscription',
        component: () => import('@/pages/app/billing/BillingSubscriptionPage.vue'),
        meta: {
          title: 'Assinatura',
          requiresAuth: true,
          permissionsAll: ['saas.subscriptions.read'],
        },
      },
      {
        path: 'billing/payments',
        name: 'billing-payments',
        component: () => import('@/pages/app/billing/BillingPaymentsPage.vue'),
        meta: {
          title: 'Pagamentos SaaS',
          requiresAuth: true,
          permissionsAll: ['saas.payments.read'],
        },
      },
      {
        path: 'billing/usage',
        name: 'billing-usage',
        component: () => import('@/pages/app/billing/BillingUsagePage.vue'),
        meta: {
          title: 'Uso SaaS',
          requiresAuth: true,
          permissionsAll: ['saas.usage.read'],
        },
      },
      {
        path: 'billing/modules',
        name: 'billing-modules',
        component: () => import('@/pages/app/billing/BillingModulesPage.vue'),
        meta: {
          title: 'Módulos Habilitados',
          requiresAuth: true,
          permissionsAll: ['saas.modules.read'],
        },
      },
      ...resourceRoutes,
      ...reportRoutes,
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

function missingPermission(
  route: RouteLocationNormalized,
  hasPermission: (permission: string) => boolean,
): string | null {
  const permissionsAll = route.meta.permissionsAll ?? []
  const permissionsAny = route.meta.permissionsAny ?? []

  const missingRequired = permissionsAll.find((permission) => !hasPermission(permission))
  if (missingRequired) {
    return missingRequired
  }

  if (
    permissionsAny.length > 0 &&
    !permissionsAny.some((permission) => hasPermission(permission))
  ) {
    return permissionsAny[0] ?? null
  }

  return null
}

function missingModule(
  route: RouteLocationNormalized,
  hasModule: (moduleCode: ModuleCode) => boolean,
): ModuleCode | null {
  const modulesAll = route.meta.modulesAll ?? []
  const modulesAny = route.meta.modulesAny ?? []

  const missingRequired = modulesAll.find((moduleCode) => !hasModule(moduleCode))
  if (missingRequired) {
    return missingRequired
  }

  if (modulesAny.length > 0 && !modulesAny.some((moduleCode) => hasModule(moduleCode))) {
    return modulesAny[0] ?? null
  }

  return null
}

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.initialize()

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { path: '/app/dashboard' }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
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

  const unauthorizedPermission = missingPermission(to, auth.hasPermission)
  if (unauthorizedPermission) {
    return {
      name: 'forbidden',
      query: {
        reason: 'permission',
        resource: unauthorizedPermission,
      },
    }
  }

  const unauthorizedModule = missingModule(to, auth.hasModule)
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

router.afterEach((to) => {
  const suffix = 'Mov Flow'
  document.title = to.meta.title ? `${to.meta.title} | ${suffix}` : suffix
})

export default router
