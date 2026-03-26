<template>
  <div class="auth-screen">
    <div class="theme-action">
      <ThemeModeMenu />
    </div>

    <v-container class="fill-height py-8">
      <v-row class="h-100 align-center justify-center">
        <v-col cols="12" lg="10" xl="9">
          <v-card class="auth-frame" variant="flat">
            <v-row class="ma-0">
              <v-col class="auth-side pa-8 pa-md-10" cols="12" md="5">
                <div class="d-flex align-center ga-2 mb-6">
                  <v-avatar
                    class="brand-avatar"
                    color="primary"
                    rounded="lg"
                    size="34"
                    variant="flat"
                  >
                    <v-icon icon="mdi-truck-fast-outline" size="20" />
                  </v-avatar>
                  <div class="text-subtitle-1 font-weight-bold">MOV FLOW</div>
                </div>

                <h1 class="text-h4 font-weight-bold mb-3">{{ title }}</h1>
                <p class="text-body-1 text-medium-emphasis mb-6">{{ description }}</p>

                <v-list class="pa-0 bg-transparent" density="compact">
                  <v-list-item
                    v-for="item in highlights"
                    :key="item"
                    class="px-0"
                    prepend-icon="mdi-check-circle-outline"
                  >
                    <v-list-item-title class="text-body-2">{{ item }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col class="pa-6 pa-md-10 d-flex align-center" cols="12" md="7">
                <div class="w-100">
                  <slot />
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
  import ThemeModeMenu from '@/components/ui/ThemeModeMenu.vue'

  defineProps<{
    title: string
    description: string
    highlights: string[]
  }>()
</script>

<style scoped>
.auth-screen {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(900px 500px at -10% -20%, rgba(var(--v-theme-primary), 0.18), transparent 70%),
    radial-gradient(
      900px 600px at 115% 120%,
      rgba(var(--v-theme-secondary), 0.18),
      transparent 72%
    ),
    rgb(var(--v-theme-background));
}

.theme-action {
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 2;
}

.auth-frame {
  border: 1px solid rgb(var(--v-theme-border));
  overflow: hidden;
}

.auth-side {
  border-right: 1px solid rgb(var(--v-theme-divider));
  background: rgb(var(--v-theme-surface-variant));
}

.brand-avatar {
  border: 1px solid rgb(var(--v-theme-border));
}

@media (max-width: 959px) {
  .auth-side {
    border-right: 0;
    border-bottom: 1px solid rgb(var(--v-theme-divider));
  }
}
</style>
