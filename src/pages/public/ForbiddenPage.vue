<template>
  <div class="public-state-screen">
    <div class="theme-action">
      <ThemeModeMenu />
    </div>

    <v-container class="fill-height d-flex align-center justify-center">
      <v-card class="pa-6 surface-card" max-width="640" variant="flat">
        <v-chip class="mb-4" color="error" prepend-icon="mdi-shield-alert-outline" variant="tonal">
          Acesso restrito
        </v-chip>

        <h1 class="text-h4 font-weight-bold mb-2">
          Este recurso nao esta disponivel para seu perfil
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-4">{{ reasonLabel }}</p>

        <v-alert class="mb-6" type="warning" variant="tonal">
          Recurso solicitado: <strong>{{ resourceLabel }}</strong>
        </v-alert>

        <div class="d-flex ga-3 flex-wrap">
          <v-btn color="primary" prepend-icon="mdi-view-dashboard-outline" to="/app/dashboard">
            Voltar para o painel
          </v-btn>
          <v-btn prepend-icon="mdi-credit-card-outline" to="/app/billing" variant="outlined">
            Ver assinatura
          </v-btn>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import ThemeModeMenu from '@/components/ui/ThemeModeMenu.vue'

  const route = useRoute()

  const reason = computed(() => {
    const value = route.query.reason
    return typeof value === 'string' ? value : 'permission'
  })

  const resourceLabel = computed(() => {
    const value = route.query.resource
    return typeof value === 'string' ? value : 'nao informado'
  })

  const reasonLabel = computed(() => {
    if (reason.value === 'module') {
      return 'O plano atual da sua empresa nao inclui este recurso.'
    }

    return 'Seu perfil de acesso nao possui permissao para esta acao.'
  })
</script>

<style scoped>
.public-state-screen {
  position: relative;
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

.theme-action {
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 2;
}
</style>
