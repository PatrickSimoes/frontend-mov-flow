<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" max-width="520" rounded="xl">
      <h1 class="text-h5 font-weight-bold mb-2">Mov Flow Frontend</h1>
      <p class="text-body-2 text-medium-emphasis mb-4">
        A rota raiz foi substituída por roteamento explícito em <code>/app/dashboard</code>.
      </p>
      <v-btn color="primary" prepend-icon="mdi-arrow-right" to="/app/dashboard">Abrir dashboard</v-btn>
    </v-card>
  </v-container>
</template>
