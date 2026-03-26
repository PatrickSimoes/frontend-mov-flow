<template>
  <v-chip :color="chipColor" size="small" :variant="chipVariant">
    {{ label }}
  </v-chip>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    status: string
  }

  const props = defineProps<Props>()

  const normalized = computed(() => props.status.trim().toLowerCase())

  const chipColor = computed(() => {
    if (
      [
        'active',
        'paid',
        'delivered',
        'done',
        'reconciled',
        'completed',
        'success',
        'trialing',
      ].includes(normalized.value)
    ) {
      return 'success'
    }

    if (
      ['pending', 'incomplete', 'open', 'in transit', 'in_transit', 'scheduled', 'warning'].includes(
        normalized.value,
      )
    ) {
      return 'warning'
    }

    if (
      [
        'canceled',
        'cancelled',
        'failed',
        'overdue',
        'divergent',
        'blocked',
        'error',
        'past_due',
      ].includes(normalized.value)
    ) {
      return 'error'
    }

    return 'info'
  })

  const chipVariant = computed<'flat' | 'tonal'>(() => {
    return ['active', 'paid', 'delivered', 'done', 'reconciled', 'success', 'trialing'].includes(
      normalized.value,
    )
      ? 'flat'
      : 'tonal'
  })

  const label = computed(() => {
    if (!props.status) return '-'
    return props.status
  })
</script>
