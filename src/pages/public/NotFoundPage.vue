<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" max-width="560" rounded="xl">
      <v-chip class="mb-4" color="secondary" prepend-icon="mdi-map-marker-question-outline" variant="tonal">
        404
      </v-chip>

      <h1 class="text-h4 font-weight-bold mb-2">Página não encontrada</h1>
      <p class="text-body-1 text-medium-emphasis mb-6">
        O endereço solicitado não existe ou foi movido para outra rota da aplicação.
      </p>

      <v-btn color="primary" prepend-icon="mdi-arrow-left" to="/app/dashboard">
        Ir para o dashboard
      </v-btn>
    </v-card>
  </v-container>
</template>
