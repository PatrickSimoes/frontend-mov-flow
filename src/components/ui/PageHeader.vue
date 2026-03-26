<template>
  <div class="page-header d-flex flex-wrap align-center justify-space-between ga-4 mb-6">
    <div class="header-content">
      <div v-if="eyebrow" class="text-caption text-medium-emphasis text-uppercase mb-1">
        {{ eyebrow }}
      </div>
      <h1 class="text-h4 font-weight-bold mb-1">{{ title }}</h1>
      <p v-if="subtitle" class="text-body-1 text-medium-emphasis mb-0">{{ subtitle }}</p>
    </div>

    <div class="d-flex align-center flex-wrap ga-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title: string
    subtitle?: string
    eyebrow?: string
  }>()
</script>

<style scoped>
.page-header {
  gap: 1rem;
}

.header-content {
  max-width: 900px;
}
</style>
