<template>
  <v-chip :color="color" size="small" variant="tonal">
    {{ label }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: unknown
}>()

const textValue = computed(() => String(props.value ?? '-').trim())

const color = computed(() => {
  const normalized = textValue.value.toUpperCase()

  if (!normalized || normalized === '-') return 'default'
  if (['ACTIVE', 'PAID', 'DELIVERED', 'RECONCILED', 'DONE', 'SUCCESS', 'OPEN'].includes(normalized))
    return 'success'
  if (['PENDING', 'PARTIAL', 'IN_PROGRESS', 'IN_TRANSIT', 'TRIALING'].includes(normalized))
    return 'warning'
  if (['CANCELED', 'FAILED', 'OVERDUE', 'DIVERGENT', 'INACTIVE', 'PAST_DUE'].includes(normalized))
    return 'error'

  return 'info'
})

const label = computed(() => {
  return textValue.value.replace(/_/g, ' ')
})
</script>
