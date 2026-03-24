<template>
  <AppPageHeader subtitle="Planos disponíveis para assinatura" title="Planos">
    <template #actions>
      <v-btn color="primary" prepend-icon="mdi-refresh" @click="loadPlans">Atualizar</v-btn>
    </template>
  </AppPageHeader>

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
    {{ errorMessage }}
  </v-alert>

  <v-row>
    <v-col v-for="plan in plans" :key="plan.id" cols="12" lg="4" md="6">
      <v-card class="h-100" rounded="xl" variant="flat">
        <v-card-item>
          <div class="d-flex align-center justify-space-between ga-2">
            <div class="text-subtitle-1 font-weight-bold">{{ plan.name }}</div>
            <v-chip color="primary" size="small" variant="tonal">{{ plan.code }}</v-chip>
          </div>
          <div class="text-body-2 text-medium-emphasis mt-2">
            {{ plan.description || 'Sem descrição' }}
          </div>
        </v-card-item>

        <v-card-text>
          <div class="text-h5 font-weight-bold mb-2">
            {{ formatCurrency(plan.monthlyPrice, plan.currency) }}/mês
          </div>
          <div class="text-caption text-medium-emphasis">
            Limites: usuários {{ plan.maxUsers ?? '∞' }}, veículos {{ plan.maxVehicles ?? '∞' }},
            shipments {{ plan.maxShipments ?? '∞' }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn
            block
            color="primary"
            :disabled="!canCheckout"
            :loading="checkoutLoadingPlanId === plan.id"
            prepend-icon="mdi-credit-card-fast-outline"
            @click="startCheckout(plan.id)"
          >
            {{ canCheckout ? 'Assinar plano' : 'Sem permissão checkout' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <AppEmptyState
    v-if="!loading && plans.length === 0"
    description="Nenhum plano retornado para o perfil atual."
    title="Sem planos disponíveis"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { apiClient } from '@/core/http/client'
import AppEmptyState from '@/shared/components/AppEmptyState.vue'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'
import { useAuthStore } from '@/stores/auth'

interface Plan {
  id: string
  name: string
  code: string
  description?: string
  monthlyPrice: number
  currency: string
  maxUsers?: number | null
  maxVehicles?: number | null
  maxShipments?: number | null
}

interface CheckoutResponse {
  id: string
  url: string
}

const auth = useAuthStore()

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const checkoutLoadingPlanId = ref<string | null>(null)
const plans = ref<Plan[]>([])

const canCheckout = computed(() => auth.hasPermission('saas.subscriptions.checkout'))

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

async function loadPlans() {
  loading.value = true
  errorMessage.value = null

  try {
    plans.value = await apiClient.get<Plan[]>('/saas/plans')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao carregar planos.'
    plans.value = []
  } finally {
    loading.value = false
  }
}

async function startCheckout(planId: string) {
  if (!canCheckout.value) return

  checkoutLoadingPlanId.value = planId
  errorMessage.value = null

  try {
    const payload = {
      planId,
      successUrl: `${window.location.origin}/app/billing/subscription?checkout=success`,
      cancelUrl: `${window.location.origin}/app/billing/plans?checkout=cancel`,
    }

    const session = await apiClient.post<CheckoutResponse>('/saas/subscriptions/checkout', payload)
    window.location.assign(session.url)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível iniciar checkout.'
  } finally {
    checkoutLoadingPlanId.value = null
  }
}

void loadPlans()
</script>
