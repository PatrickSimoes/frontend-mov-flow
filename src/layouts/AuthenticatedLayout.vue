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
        <h1 class="text-h5 font-weight-bold">Portal SaaS</h1>
        <div class="text-body-2 text-medium-emphasis">Logística, operação e financeiro multi-tenant</div>
      </div>

      <v-divider class="mb-2" />

      <v-list class="px-2" density="comfortable" nav>
        <template v-for="section in visibleNavigation" :key="section.title">
          <v-list-subheader class="text-uppercase text-caption">{{ section.title }}</v-list-subheader>

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
              variant="outlined"
            >
              Nenhum módulo ativo
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

        <v-app-bar-title class="text-h6 font-weight-bold">{{ pageTitle }}</v-app-bar-title>

        <v-chip
          v-if="session.state.tenant"
          class="mr-3"
          color="secondary"
          size="small"
          variant="flat"
        >
          {{ session.state.tenant.slug }}
        </v-chip>

        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-account-circle-outline" variant="text" />
          </template>

          <v-card min-width="280" rounded="xl">
            <v-card-text>
              <div class="text-subtitle-1 font-weight-bold">
                {{ session.state.session?.user.name || 'Usuário' }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ session.state.session?.user.email || '-' }}
              </div>
              <div class="text-caption mt-2">
                Roles: {{ session.state.session?.user.roles.join(', ') || 'sem role' }}
              </div>
            </v-card-text>

            <v-divider />

            <v-card-actions>
              <v-btn color="primary" prepend-icon="mdi-cog-outline" to="/app/settings" variant="text">
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

    <v-snackbar v-model="showSessionWarning" color="warning" timeout="5000">
      {{ session.state.bootstrapError }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
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
  background:
    radial-gradient(1200px 500px at 90% -10%, rgb(44 146 134 / 16%), transparent 60%),
    radial-gradient(900px 400px at -10% 110%, rgb(214 142 38 / 14%), transparent 60%),
    linear-gradient(180deg, rgb(248 250 246) 0%, rgb(242 245 240) 100%);
  min-height: 100vh;
}
</style>
