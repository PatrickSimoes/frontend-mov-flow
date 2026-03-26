<template>
  <div class="public-state-screen">
    <div class="theme-action">
      <ThemeModeMenu />
    </div>

    <v-container class="fill-height d-flex align-center justify-center">
      <v-card class="pa-6 surface-card" max-width="560" variant="flat">
        <v-chip
          class="mb-4"
          color="secondary"
          prepend-icon="mdi-map-marker-question-outline"
          variant="tonal"
        >
          Pagina nao encontrada
        </v-chip>

        <h1 class="text-h4 font-weight-bold mb-2">Nao encontramos esta pagina</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          O endereco informado pode estar incorreto ou o conteudo foi movido.
        </p>

        <v-btn color="primary" prepend-icon="mdi-arrow-left" to="/app/dashboard">
          Ir para o painel
        </v-btn>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
  import ThemeModeMenu from '@/components/ui/ThemeModeMenu.vue'
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
