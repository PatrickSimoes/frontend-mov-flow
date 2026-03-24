<template>
  <AppPageHeader subtitle="Assinatura atual do tenant" title="Assinatura" />

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
    {{ errorMessage }}
  </v-alert>

  <v-card rounded="xl" variant="flat">
    <v-card-text>
      <v-skeleton-loader v-if="loading" type="article" />

      <div v-else-if="subscription">
        <v-chip class="mb-4" :color="statusColor(subscription.status)" variant="tonal">
          {{ subscription.status }}
        </v-chip>

        <v-row>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Plano</div>
            <div class="text-body-1 mb-3">{{ subscription.plan?.name || subscription.planId }}</div>

            <div class="text-caption text-medium-emphasis">Status</div>
            <div class="text-body-1 mb-3">{{ subscription.status }}</div>

            <div class="text-caption text-medium-emphasis">Início</div>
            <div class="text-body-1 mb-3">{{ formatDate(subscription.startsAt) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Período atual</div>
            <div class="text-body-1 mb-3">
              {{ formatDate(subscription.currentPeriodStart) }} até
              {{ formatDate(subscription.currentPeriodEnd) }}
            </div>

            <div class="text-caption text-medium-emphasis">Cancelada em</div>
            <div class="text-body-1 mb-3">
              {{ subscription.canceledAt ? formatDate(subscription.canceledAt) : '-' }}
            </div>
          </v-col>
        </v-row>
      </div>

      <AppEmptyState
        v-else
        description="Nenhuma assinatura ativa encontrada para este tenant."
        title="Sem assinatura"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiClient } from '@/core/http/client'
import { formatDate } from '@/core/utils/formatters'
import AppEmptyState from '@/shared/components/AppEmptyState.vue'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'

interface Subscription {
  id: string
  planId: string
  plan?: { name: string }
  status: 'INCOMPLETE' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'
  startsAt: string
  currentPeriodStart: string
  currentPeriodEnd: string
  canceledAt?: string | null
}

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const subscription = ref<Subscription | null>(null)

function statusColor(status: Subscription['status']) {
  if (status === 'ACTIVE' || status === 'TRIALING') return 'success'
  if (status === 'INCOMPLETE' || status === 'PAST_DUE') return 'warning'
  return 'error'
}

async function loadSubscription() {
  loading.value = true
  errorMessage.value = null

  try {
    subscription.value = await apiClient.get<Subscription>('/saas/subscriptions/current')
  } catch (error) {
    subscription.value = null
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao carregar assinatura.'
  } finally {
    loading.value = false
  }
}

void loadSubscription()
</script>
