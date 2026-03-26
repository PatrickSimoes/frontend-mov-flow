<template>
  <v-card class="metric-card h-100" color="surface" variant="flat">
    <v-card-text class="d-flex align-start justify-space-between ga-3">
      <div>
        <div class="text-caption text-medium-emphasis mb-1">{{ label }}</div>
        <div class="text-h4 font-weight-bold mb-1">{{ value }}</div>
        <div v-if="description" class="text-body-2 text-medium-emphasis">{{ description }}</div>
      </div>

      <v-avatar
        class="metric-icon"
        :color="iconColor || 'primary'"
        rounded="lg"
        size="38"
        variant="tonal"
      >
        <v-icon :icon="icon" size="20" />
      </v-avatar>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  defineProps<{
    label: string
    value: string
    description?: string
    icon: string
    iconColor?: string
  }>()
</script>

<style scoped>
.metric-card {
  border: 1px solid rgb(var(--v-theme-border));
}

.metric-icon {
  border: 1px solid rgb(var(--v-theme-border));
}
</style>
