<template>
  <v-layout class="app-shell">
    <v-navigation-drawer
      v-model="drawer"
      class="shell-drawer"
      color="surface"
      :temporary="display.mdAndDown.value"
      width="296"
    >
      <div class="drawer-brand px-5 pt-6 pb-4">
        <div class="d-flex align-center ga-3 mb-3">
          <v-avatar
            class="brand-avatar"
            color="primary"
            rounded="lg"
            size="36"
            variant="flat"
          >
            <v-icon icon="mdi-truck-fast-outline" size="20" />
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold">MOV FLOW</div>
            <div class="text-caption text-medium-emphasis">Gestao operacional</div>
          </div>
        </div>

        <v-chip class="text-caption" color="secondary" size="small" variant="tonal">
          {{ companyLabel }}
        </v-chip>
      </div>

      <v-divider />

      <v-list class="px-2 py-3" density="comfortable" nav>
        <template v-for="section in visibleNavigation" :key="section.title">
          <v-list-subheader class="text-uppercase text-caption section-label">{{
            section.title
          }}</v-list-subheader>

          <v-list-item
            v-for="item in section.items"
            :key="item.to"
            class="mb-1"
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
          <div class="text-caption text-medium-emphasis mb-2">Recursos do plano</div>

          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip
              v-for="moduleCode in session.state.enabledModules"
              :key="moduleCode"
              color="primary"
              size="small"
              variant="tonal"
            >
              {{ MODULE_LABELS[moduleCode] }}
            </v-chip>

            <v-chip
              v-if="session.state.enabledModules.length === 0"
              color="warning"
              size="small"
              variant="tonal"
            >
              Sem recursos ativos
            </v-chip>
          </div>

          <v-btn
            block
            color="error"
            prepend-icon="mdi-logout"
            variant="tonal"
            @click="handleLogout"
          >
            Sair
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main class="shell-main">
      <v-app-bar class="shell-topbar px-2 px-sm-4" color="surface" flat height="72">
        <v-btn
          v-if="display.mdAndDown.value"
          icon="mdi-menu"
          variant="text"
          @click="drawer = !drawer"
        />

        <div class="d-none d-md-flex align-center">
          <v-breadcrumbs density="compact" :items="breadcrumbs">
            <template #divider>
              <v-icon icon="mdi-chevron-right" size="16" />
            </template>
          </v-breadcrumbs>
        </div>

        <v-app-bar-title class="d-md-none text-subtitle-1 font-weight-bold">
          {{ pageTitle }}
        </v-app-bar-title>

        <v-spacer />

        <ThemeModeMenu />

        <v-chip
          v-if="session.state.tenant"
          class="ml-1"
          color="secondary"
          size="small"
          variant="tonal"
        >
          Codigo: {{ companyCode }}
        </v-chip>

        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn v-bind="props" class="ml-1" icon="mdi-account-circle-outline" variant="text" />
          </template>

          <v-card min-width="280">
            <v-card-text>
              <div class="text-subtitle-1 font-weight-bold">{{ userName }}</div>
              <div class="text-body-2 text-medium-emphasis mb-2">{{ userEmail }}</div>
              <div class="text-caption">Perfil: {{ userRoles }}</div>
            </v-card-text>

            <v-divider />

            <v-card-actions>
              <v-btn
                color="primary"
                prepend-icon="mdi-cog-outline"
                to="/app/settings"
                variant="text"
              >
                Configuracoes
              </v-btn>
              <v-spacer />
              <v-btn color="error" prepend-icon="mdi-logout" variant="text" @click="handleLogout">
                Sair
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-app-bar>

      <v-container class="app-page-container pt-6 pb-10" fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-layout>

  <v-snackbar v-model="showSessionWarning" color="warning" timeout="5000">
    {{ session.state.bootstrapError }}
  </v-snackbar>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import ThemeModeMenu from '@/components/ui/ThemeModeMenu.vue'
  import { MODULE_LABELS, NAVIGATION, type NavItem } from '@/config/navigation'
  import { useSessionStore } from '@/stores/session'

  const display = useDisplay()
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()

  const drawer = ref(!display.mdAndDown.value)
  const showSessionWarning = ref(false)

  watch(
    () => display.mdAndDown.value,
    isMobile => {
      drawer.value = !isMobile
    },
  )

  watch(
    () => session.state.bootstrapError,
    message => {
      showSessionWarning.value = Boolean(message)
    },
  )

  const pageTitle = computed(() => {
    return (route.meta.title as string | undefined) || 'Mov Flow'
  })

  const breadcrumbs = computed(() => {
    const titledRecords = route.matched.filter(record => typeof record.meta?.title === 'string')

    return titledRecords.map((record, index) => ({
      title: record.meta.title as string,
      disabled: index === titledRecords.length - 1,
      to: index === titledRecords.length - 1 ? undefined : record.path,
    }))
  })

  const companyLabel = computed(() => {
    return session.state.tenant?.name || 'Empresa nao identificada'
  })

  const companyCode = computed(() => {
    return session.state.tenant?.slug || '--'
  })

  const userName = computed(() => {
    return session.state.session?.user.name || 'Usuario'
  })

  const userEmail = computed(() => {
    return session.state.session?.user.email || '-'
  })

  const userRoles = computed(() => {
    return session.state.session?.user.roles.join(', ') || 'Sem perfil'
  })

  function canAccessItem (item: NavItem): boolean {
    if (item.permissionsAll && !session.hasAllPermissions(item.permissionsAll)) {
      return false
    }

    if (item.permissionsAny && !session.hasAnyPermission(item.permissionsAny)) {
      return false
    }

    if (item.modulesAll && !session.hasAllModules(item.modulesAll)) {
      return false
    }

    if (item.modulesAny && !session.hasAnyModule(item.modulesAny)) {
      return false
    }

    return true
  }

  const visibleNavigation = computed(() => {
    return NAVIGATION.map(section => ({
      ...section,
      items: section.items.filter(item => canAccessItem(item)),
    })).filter(section => section.items.length > 0)
  })

  function handleLogout () {
    session.logout()
    router.push({ name: 'login' })
  }
</script>

<style scoped>
.app-shell {
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.shell-drawer {
  border-right: 1px solid rgb(var(--v-theme-divider));
}

.drawer-brand {
  background: rgb(var(--v-theme-surface-variant));
}

.brand-avatar {
  border: 1px solid rgb(var(--v-theme-border));
}

.section-label {
  letter-spacing: 0.06em;
}

.shell-main {
  min-height: 100vh;
}

.shell-topbar {
  border-bottom: 1px solid rgb(var(--v-theme-divider));
}
</style>
