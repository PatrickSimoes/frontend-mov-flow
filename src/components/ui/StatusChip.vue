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

  interface StatusStyle {
    label: string
    color: 'success' | 'warning' | 'error' | 'info' | 'secondary'
    variant: 'flat' | 'tonal'
  }

  const STATUS_STYLES: Record<string, StatusStyle> = {
    active: { label: 'Ativo', color: 'success', variant: 'flat' },
    confirmed: { label: 'Confirmado', color: 'success', variant: 'flat' },
    delivered: { label: 'Entregue', color: 'success', variant: 'flat' },
    done: { label: 'Concluido', color: 'success', variant: 'flat' },
    paid: { label: 'Pago', color: 'success', variant: 'flat' },
    reconciled: { label: 'Conciliado', color: 'success', variant: 'flat' },
    success: { label: 'Sucesso', color: 'success', variant: 'flat' },

    assigned: { label: 'Atribuido', color: 'warning', variant: 'tonal' },
    created: { label: 'Criado', color: 'info', variant: 'tonal' },
    in_transit: { label: 'Em transito', color: 'warning', variant: 'tonal' },
    incomplete: { label: 'Incompleto', color: 'warning', variant: 'tonal' },
    maintenance: { label: 'Em manutencao', color: 'warning', variant: 'tonal' },
    open: { label: 'Em aberto', color: 'warning', variant: 'tonal' },
    partial: { label: 'Parcial', color: 'warning', variant: 'tonal' },
    pending: { label: 'Pendente', color: 'warning', variant: 'tonal' },
    scheduled: { label: 'Agendado', color: 'info', variant: 'tonal' },
    shipped: { label: 'Em envio', color: 'info', variant: 'tonal' },
    trialing: { label: 'Em teste', color: 'info', variant: 'tonal' },
    warning: { label: 'Atencao', color: 'warning', variant: 'tonal' },

    blocked: { label: 'Bloqueado', color: 'error', variant: 'tonal' },
    canceled: { label: 'Cancelado', color: 'error', variant: 'tonal' },
    cancelled: { label: 'Cancelado', color: 'error', variant: 'tonal' },
    closed: { label: 'Fechado', color: 'secondary', variant: 'tonal' },
    divergent: { label: 'Divergente', color: 'error', variant: 'tonal' },
    error: { label: 'Erro', color: 'error', variant: 'tonal' },
    failed: { label: 'Falhou', color: 'error', variant: 'tonal' },
    inactive: { label: 'Inativo', color: 'error', variant: 'tonal' },
    overdue: { label: 'Vencido', color: 'error', variant: 'tonal' },
    past_due: { label: 'Atrasado', color: 'error', variant: 'tonal' },
  }

  const normalized = computed(() => {
    return props.status?.trim().toLowerCase().replace(/\s+/g, '_') ?? ''
  })

  const resolvedStyle = computed<StatusStyle>(() => {
    if (!normalized.value) {
      return {
        label: '-',
        color: 'info',
        variant: 'tonal',
      }
    }

    return (
      STATUS_STYLES[normalized.value] ?? {
        label: normalized.value.replace(/_/g, ' '),
        color: 'info',
        variant: 'tonal',
      }
    )
  })

  const chipColor = computed(() => resolvedStyle.value.color)
  const chipVariant = computed(() => resolvedStyle.value.variant)
  const label = computed(() => resolvedStyle.value.label)
</script>
