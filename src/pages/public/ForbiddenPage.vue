<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" max-width="620" rounded="xl">
      <v-chip class="mb-4" color="error" prepend-icon="mdi-lock-outline" variant="tonal">
        Acesso negado
      </v-chip>

      <h1 class="text-h4 font-weight-bold mb-2">Este recurso não está disponível</h1>
      <p class="text-body-1 text-medium-emphasis mb-4">{{ reasonLabel }}</p>

      <v-alert class="mb-6" type="warning" variant="tonal">
        Recurso: <strong>{{ resourceLabel }}</strong>
      </v-alert>

      <div class="d-flex ga-3 flex-wrap">
        <v-btn color="primary" prepend-icon="mdi-view-dashboard-outline" to="/app/dashboard">
          Voltar ao dashboard
        </v-btn>
        <v-btn prepend-icon="mdi-credit-card-outline" to="/app/billing" variant="outlined">
          Ver billing/plano
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  const reason = computed(() => {
    const value = route.query.reason
    return typeof value === 'string' ? value : 'permission'
  })

  const resourceLabel = computed(() => {
    const value = route.query.resource
    return typeof value === 'string' ? value : 'indefinido'
  })

  const reasonLabel = computed(() => {
    if (reason.value === 'module') {
      return 'O tenant atual não possui o módulo necessário no plano ativo.'
    }

    return 'O usuário autenticado não possui a permissão necessária para esta rota.'
  })
</script>
