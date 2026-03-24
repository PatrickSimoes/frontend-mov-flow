<template>
  <div class="empty-state text-center py-10 px-6">
    <v-icon class="mb-3" color="primary" :icon="icon" size="42" />
    <div class="text-h6 font-weight-bold mb-1">{{ title }}</div>
    <div class="text-body-2 text-medium-emphasis">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    icon?: string
  }>(),
  {
    icon: 'mdi-database-search-outline',
  },
)
</script>

<style scoped>
.empty-state {
  border: 1px dashed rgb(var(--v-theme-outline));
  border-radius: 18px;
  background: rgb(var(--v-theme-surface));
}
</style>
