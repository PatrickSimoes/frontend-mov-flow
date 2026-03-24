<template>
  <div class="app-shell">
    <v-navigation-drawer
      v-model="drawer"
      border="0"
      color="surface"
      :temporary="display.mdAndDown.value"
      width="320"
    >
      <div class="pa-6 pb-2">
        <div class="text-overline text-secondary">Mov Flow</div>
        <h1 class="text-h5 font-weight-bold">ERP SaaS</h1>
        <div class="text-body-2 text-medium-emphasis">
          Operação, financeiro e billing multi-tenant
        </div>
      </div>

      <v-divider class="mb-2" />

      <v-list class="px-2" density="comfortable" nav>
        <template v-for="section in visibleSections" :key="section.title">
          <v-list-subheader class="text-uppercase text-caption">{{
            section.title
          }}</v-list-subheader>

          <v-list-item
            v-for="item in section.items"
            :key="item.to"
            :prepend-icon="item.icon"
            rounded="lg"
            :subtitle="item.subtitle"
            :title="item.title"
            :to="item.to"
          />
        </template>
      </v-list>

      <template #append>
        <v-divider class="mb-3" />
        <div class="px-4 pb-5">
          <div class="text-caption text-medium-emphasis mb-2">Módulos habilitados</div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="moduleCode in auth.enabledModules"
              :key="moduleCode"
              color="primary"
              size="small"
              variant="tonal"
            >
              {{ moduleCode }}
            </v-chip>
            <v-chip
              v-if="auth.enabledModules.length === 0"
              color="warning"
              size="small"
              variant="outlined"
            >
              Não informado
            </v-chip>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-app-bar class="px-2" color="transparent" flat>
        <v-btn
          v-if="display.mdAndDown.value"
          icon="mdi-menu"
          variant="text"
          @click="drawer = !drawer"
        />

        <div class="d-flex flex-column">
          <v-breadcrumbs class="pa-0" density="compact">
            <v-breadcrumbs-item
              v-for="crumb in breadcrumbs"
              :key="crumb.key"
              :disabled="crumb.disabled"
              :to="crumb.to"
            >
              {{ crumb.title }}
            </v-breadcrumbs-item>
          </v-breadcrumbs>

          <div class="text-subtitle-1 font-weight-bold">{{ pageTitle }}</div>
        </div>

        <v-spacer />

        <v-chip v-if="auth.tenant" class="mr-3" color="secondary" size="small" variant="flat">
          {{ auth.tenant.slug }}
        </v-chip>

        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-account-circle-outline" variant="text" />
          </template>

          <v-card min-width="300" rounded="xl">
            <v-card-text>
              <div class="text-subtitle-1 font-weight-bold">
                {{ auth.session?.user.name || 'Usuário' }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ auth.session?.user.email || '-' }}
              </div>
              <div class="text-caption mt-2">
                Roles: {{ auth.session?.user.roles.join(', ') || 'sem role' }}
              </div>
            </v-card-text>

            <v-divider />

            <v-card-actions>
              <v-btn
                color="primary"
                prepend-icon="mdi-cog-outline"
                to="/app/admin/settings"
                variant="text"
              >
                Configurações
              </v-btn>
              <v-spacer />
              <v-btn color="error" prepend-icon="mdi-logout" variant="text" @click="handleLogout">
                Sair
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-app-bar>

      <v-container class="pb-8" fluid>
        <router-view />
      </v-container>
    </v-main>

    <AppSnackbar />
    <AppConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import type { ModuleCode } from '@/core/types/auth'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { reports, resources } from '@/modules/registry/resources'
import AppConfirmDialog from '@/shared/components/AppConfirmDialog.vue'
import AppSnackbar from '@/shared/components/AppSnackbar.vue'
import { useAppShellStore } from '@/stores/app-shell'
import { useAuthStore } from '@/stores/auth'

type NavItem = {
  title: string
  subtitle: string
  to: string
  icon: string
  permissionsAny?: string[]
  permissionsAll?: string[]
  modulesAny?: ModuleCode[]
  modulesAll?: ModuleCode[]
}

type NavSection = {
  title: string
  items: NavItem[]
}

const display = useDisplay()
const route = useRoute()
const router = useRouter()

const auth = useAuthStore()
const appShell = useAppShellStore()

const drawer = computed({
  get: () => appShell.drawerOpen,
  set: (value) => appShell.setDrawer(value),
})

watch(
  () => display.mdAndDown.value,
  (isMobile) => {
    appShell.setDrawer(!isMobile)
  },
  { immediate: true },
)

watch(
  () => auth.bootstrapError,
  (message) => {
    if (message) appShell.notify(message, 'warning')
  },
)

const staticSections = computed<NavSection[]>(() => {
  return [
    {
      title: 'Visão Geral',
      items: [
        {
          title: 'Dashboard',
          subtitle: 'Resumo do tenant, sessão e módulos',
          to: '/app/dashboard',
          icon: 'mdi-view-dashboard-outline',
        },
      ],
    },
    {
      title: 'Admin',
      items: [
        {
          title: 'Meu Tenant',
          subtitle: 'Dados do tenant autenticado',
          to: '/app/admin/tenant',
          icon: 'mdi-domain',
          permissionsAll: ['tenants.read'],
        },
        {
          title: 'Configurações',
          subtitle: 'Parâmetros globais do tenant',
          to: '/app/admin/settings',
          icon: 'mdi-cog-outline',
          permissionsAll: ['settings.read'],
        },
      ],
    },
    {
      title: 'Billing',
      items: [
        {
          title: 'Planos',
          subtitle: 'Catálogo de planos SaaS',
          to: '/app/billing/plans',
          icon: 'mdi-credit-card-outline',
          permissionsAll: ['saas.plans.read'],
        },
        {
          title: 'Assinatura',
          subtitle: 'Status da assinatura atual',
          to: '/app/billing/subscription',
          icon: 'mdi-file-document-check-outline',
          permissionsAll: ['saas.subscriptions.read'],
        },
        {
          title: 'Pagamentos',
          subtitle: 'Histórico de cobranças SaaS',
          to: '/app/billing/payments',
          icon: 'mdi-cash-check',
          permissionsAll: ['saas.payments.read'],
        },
        {
          title: 'Uso',
          subtitle: 'Métricas e consumo do tenant',
          to: '/app/billing/usage',
          icon: 'mdi-chart-bar',
          permissionsAll: ['saas.usage.read'],
        },
        {
          title: 'Módulos',
          subtitle: 'Módulos habilitados por assinatura',
          to: '/app/billing/modules',
          icon: 'mdi-puzzle-outline',
          permissionsAll: ['saas.modules.read'],
        },
      ],
    },
  ]
})

const resourceSections = computed<NavSection[]>(() => {
  const adminItems = resources
    .filter((resource) => resource.section === 'admin')
    .map<NavItem>((resource) => ({
      title: resource.title,
      subtitle: resource.subtitle,
      to: resource.routePath,
      icon: resource.icon,
      permissionsAll: [resource.permissions.read],
      modulesAll: resource.moduleAccess ? [resource.moduleAccess] : undefined,
    }))

  const operationsItems = resources
    .filter((resource) => resource.section === 'operations')
    .map<NavItem>((resource) => ({
      title: resource.title,
      subtitle: resource.subtitle,
      to: resource.routePath,
      icon: resource.icon,
      permissionsAll: [resource.permissions.read],
      modulesAll: resource.moduleAccess ? [resource.moduleAccess] : undefined,
    }))

  const financialItems = resources
    .filter((resource) => resource.section === 'financial')
    .map<NavItem>((resource) => ({
      title: resource.title,
      subtitle: resource.subtitle,
      to: resource.routePath,
      icon: resource.icon,
      permissionsAll: [resource.permissions.read],
      modulesAll: resource.moduleAccess ? [resource.moduleAccess] : undefined,
    }))

  const reportItems = reports.map<NavItem>((report) => ({
    title: report.title,
    subtitle: 'Relatório financeiro',
    to: report.routePath,
    icon: 'mdi-chart-line',
    permissionsAll: [report.permission],
    modulesAll: [report.moduleAccess],
  }))

  return [
    { title: 'Cadastros Admin', items: adminItems },
    { title: 'Operações', items: operationsItems },
    { title: 'Financeiro', items: financialItems },
    { title: 'Relatórios', items: reportItems },
  ]
})

function canAccessItem(item: NavItem): boolean {
  if (item.permissionsAll && !auth.hasAllPermissions(item.permissionsAll)) return false
  if (item.permissionsAny && !auth.hasAnyPermission(item.permissionsAny)) return false
  if (item.modulesAll && !auth.hasAllModules(item.modulesAll)) return false
  if (item.modulesAny && !auth.hasAnyModule(item.modulesAny)) return false
  return true
}

const visibleSections = computed(() => {
  return [...staticSections.value, ...resourceSections.value]
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessItem(item)),
    }))
    .filter((section) => section.items.length > 0)
})

const pageTitle = computed(() => {
  return (route.meta.title as string | undefined) || 'Mov Flow'
})

const breadcrumbs = computed(() => {
  return route.matched
    .filter((match) => match.meta?.title)
    .map((match, index, list) => {
      const title = String(match.meta.title)
      const disabled = index === list.length - 1

      const target = match.path.replace(/:([a-zA-Z0-9_]+)/g, (_, key: string) => {
        const value = route.params[key]
        if (Array.isArray(value)) return value[0] ?? ''
        return String(value ?? '')
      })

      return {
        key: `${match.path}-${index}`,
        title,
        disabled,
        to: disabled ? undefined : target,
      }
    })
})

function handleLogout() {
  auth.logout()
  void router.push({ name: 'login' })
}
</script>

<style scoped>
.app-shell {
  background:
    radial-gradient(1200px 500px at 90% -10%, rgb(44 146 134 / 16%), transparent 60%),
    radial-gradient(900px 400px at -10% 110%, rgb(214 142 38 / 14%), transparent 60%),
    linear-gradient(180deg, rgb(248 250 246) 0%, rgb(242 245 240) 100%);
  min-height: 100vh;
}
</style>
