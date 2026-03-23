<template>
  <v-row class="mb-4">
    <v-col cols="12" lg="4">
      <v-card class="h-100" rounded="xl">
        <v-card-item subtitle="GET /saas/subscriptions/current" title="Assinatura atual" />
        <v-card-text>
          <div v-if="currentSubscription">
            <v-chip class="mb-3" :color="statusColor(currentSubscription.status)" variant="flat">
              {{ currentSubscription.status }}
            </v-chip>
            <div class="text-body-2">
              Plano: <strong>{{ currentSubscription.plan?.name || currentSubscription.planId }}</strong>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Vigência: {{ formatDate(currentSubscription.currentPeriodStart) }} até
              {{ formatDate(currentSubscription.currentPeriodEnd) }}
            </div>
          </div>

          <v-alert v-else type="info" variant="tonal">
            Sem assinatura carregada (ou sem permissão <code>saas.subscriptions.read</code>).
          </v-alert>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card class="h-100" rounded="xl">
        <v-card-item subtitle="GET /saas/payments" title="Pagamentos" />
        <v-card-text>
          <div class="text-h4 font-weight-bold">{{ payments.length }}</div>
          <div class="text-body-2 text-medium-emphasis mb-3">pagamentos carregados</div>

          <v-list class="pa-0 bg-transparent" density="compact">
            <v-list-item v-for="payment in payments.slice(0, 3)" :key="payment.id">
              <v-list-item-title class="text-body-2">
                {{ formatCurrency(payment.amount, payment.currency) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ payment.status }} • {{ formatDate(payment.createdAt) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card class="h-100" rounded="xl">
        <v-card-item subtitle="GET /saas/usage" title="Uso" />
        <v-card-text>
          <div class="text-h4 font-weight-bold">{{ usage.length }}</div>
          <div class="text-body-2 text-medium-emphasis mb-3">métricas retornadas</div>

          <v-list class="pa-0 bg-transparent" density="compact">
            <v-list-item v-for="item in usage.slice(0, 3)" :key="item.id">
              <v-list-item-title class="text-body-2">{{ item.metric }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.usageCount }} no período {{ formatDate(item.periodStart) }} - {{ formatDate(item.periodEnd) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-card class="mb-6" rounded="xl">
    <v-card-item subtitle="GET /saas/plans" title="Planos disponíveis" />
    <v-card-text>
      <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
        {{ errorMessage }}
      </v-alert>

      <v-row>
        <v-col
          v-for="plan in plans"
          :key="plan.id"
          cols="12"
          lg="4"
          md="6"
        >
          <v-card class="h-100" rounded="lg" variant="outlined">
            <v-card-item>
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-1 font-weight-bold">{{ plan.name }}</div>
                <v-chip color="primary" size="small" variant="tonal">{{ plan.code }}</v-chip>
              </div>
              <div class="text-body-2 text-medium-emphasis mt-2">{{ plan.description || 'Sem descrição' }}</div>
            </v-card-item>

            <v-card-text>
              <div class="text-h5 font-weight-bold mb-2">
                {{ formatCurrency(plan.monthlyPrice, plan.currency) }}/mês
              </div>

              <div class="text-caption text-medium-emphasis">
                Limites:
                usuários {{ plan.maxUsers ?? '∞' }},
                veículos {{ plan.maxVehicles ?? '∞' }},
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
                {{ canCheckout ? 'Assinar plano' : 'Sem permissão de checkout' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-alert v-if="plans.length === 0 && !loading" type="info" variant="tonal">
        Nenhum plano carregado ou sem permissão para leitura de planos.
      </v-alert>
    </v-card-text>
  </v-card>

  <CapabilityGrid :items="billingCapabilities" />
</template>

<script setup lang="ts">
  import type { CapabilityItem } from '@/types/capability'
  import type { SaaSPayment, SaaSPlan, SaaSSubscription, TenantUsage } from '@/types/saas'
  import { computed, onMounted, ref } from 'vue'
  import CapabilityGrid from '@/components/app/CapabilityGrid.vue'
  import { saasApi } from '@/services/api'
  import { ApiError } from '@/services/http'
  import { useSessionStore } from '@/stores/session'

  const session = useSessionStore()

  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const checkoutLoadingPlanId = ref<string | null>(null)

  const plans = ref<SaaSPlan[]>([])
  const currentSubscription = ref<SaaSSubscription | null>(null)
  const payments = ref<SaaSPayment[]>([])
  const usage = ref<TenantUsage[]>([])

  const canCheckout = computed(() => session.hasPermission('saas.subscriptions.checkout'))

  async function loadBillingData () {
    loading.value = true
    errorMessage.value = null

    const failures: string[] = []

    if (session.hasPermission('saas.plans.read')) {
      try {
        plans.value = await saasApi.listPlans()
      } catch (error) {
        failures.push(error instanceof Error ? error.message : 'Falha ao carregar planos.')
      }
    }

    if (session.hasPermission('saas.subscriptions.read')) {
      try {
        currentSubscription.value = await saasApi.getCurrentSubscription()
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          currentSubscription.value = null
        } else {
          failures.push(error instanceof Error ? error.message : 'Falha ao carregar assinatura.')
        }
      }
    }

    if (session.hasPermission('saas.payments.read')) {
      try {
        payments.value = await saasApi.listPayments()
      } catch (error) {
        failures.push(error instanceof Error ? error.message : 'Falha ao carregar pagamentos.')
      }
    }

    if (session.hasPermission('saas.usage.read')) {
      try {
        usage.value = await saasApi.listUsage()
      } catch (error) {
        failures.push(error instanceof Error ? error.message : 'Falha ao carregar uso.')
      }
    }

    if (failures.length > 0) {
      errorMessage.value = failures[0] ?? 'Erro ao carregar dados de billing.'
    }

    loading.value = false
  }

  async function startCheckout (planId: string) {
    if (!canCheckout.value) return

    checkoutLoadingPlanId.value = planId
    errorMessage.value = null

    const successUrl = `${window.location.origin}/app/billing?checkout=success`
    const cancelUrl = `${window.location.origin}/app/billing?checkout=cancel`

    try {
      const checkoutSession = await saasApi.checkout({
        planId,
        successUrl,
        cancelUrl,
      })

      window.location.assign(checkoutSession.url)
    } catch (error) {
      errorMessage.value
        = error instanceof ApiError ? error.message : 'Não foi possível iniciar checkout de assinatura.'
    } finally {
      checkoutLoadingPlanId.value = null
    }
  }

  function formatDate (value: string): string {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('pt-BR')
  }

  function formatCurrency (value: number, currency: string): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(value))
  }

  function statusColor (status: SaaSSubscription['status']): string {
    if (status === 'ACTIVE' || status === 'TRIALING') return 'success'
    if (status === 'PAST_DUE' || status === 'INCOMPLETE') return 'warning'
    return 'error'
  }

  onMounted(() => {
    void loadBillingData()
  })

  const billingCapabilities: CapabilityItem[] = [
    {
      title: 'Planos',
      description: 'Consulta dos planos SaaS disponíveis para contratação.',
      endpoints: ['GET /saas/plans'],
      permissionsAll: ['saas.plans.read'],
    },
    {
      title: 'Assinatura Atual',
      description: 'Consulta do plano ativo e janela de ciclo vigente.',
      endpoints: ['GET /saas/subscriptions/current'],
      permissionsAll: ['saas.subscriptions.read'],
    },
    {
      title: 'Checkout de Assinatura',
      description: 'Criação de sessão Stripe com successUrl/cancelUrl definidos pelo front.',
      endpoints: ['POST /saas/subscriptions/checkout'],
      permissionsAll: ['saas.subscriptions.checkout'],
    },
    {
      title: 'Pagamentos',
      description: 'Histórico de pagamentos do tenant para billing center.',
      endpoints: ['GET /saas/payments'],
      permissionsAll: ['saas.payments.read'],
    },
    {
      title: 'Uso',
      description: 'Métricas de consumo por período para visibilidade de limites.',
      endpoints: ['GET /saas/usage'],
      permissionsAll: ['saas.usage.read'],
    },
    {
      title: 'Módulos Habilitados',
      description: 'Feature-flag por tenant para liberar ou ocultar áreas do sistema.',
      endpoints: ['GET /saas/tenant-modules/enabled'],
      permissionsAll: ['saas.modules.read'],
    },
  ]
</script>
