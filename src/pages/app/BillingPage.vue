<template>
  <PageHeader
    eyebrow="Conta"
    subtitle="Gerencie plano, historico de cobranca e consumo de recursos em um unico lugar."
    title="Assinatura"
  >
    <template #actions>
      <v-btn color="primary" prepend-icon="mdi-refresh" variant="tonal" @click="loadBillingData">
        Atualizar
      </v-btn>
    </template>
  </PageHeader>

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
    {{ errorMessage }}
  </v-alert>

  <v-row class="mb-2">
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        :description="subscriptionDescription"
        icon="mdi-card-account-details-outline"
        label="Plano atual"
        :value="currentSubscription?.plan?.name || 'Sem plano ativo'"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        :description="renewalDescription"
        icon="mdi-calendar-clock-outline"
        icon-color="secondary"
        label="Status"
        :value="
          currentSubscription
            ? formatSubscriptionStatus(currentSubscription.status)
            : 'Nao disponivel'
        "
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        :description="'Ultimos registros de cobranca'"
        icon="mdi-cash-check"
        icon-color="success"
        label="Pagamentos"
        :value="String(payments.length)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        :description="'Metricas do periodo atual'"
        icon="mdi-speedometer"
        icon-color="info"
        label="Consumo monitorado"
        :value="String(usage.length)"
      />
    </v-col>
  </v-row>

  <v-card class="surface-card mb-4" variant="flat">
    <v-card-item subtitle="Escolha o plano ideal para a sua empresa" title="Planos disponiveis" />

    <v-card-text>
      <v-row>
        <v-col
          v-for="plan in plans"
          :key="plan.id"
          cols="12"
          lg="4"
          md="6"
        >
          <v-card class="h-100" color="surface" variant="outlined">
            <v-card-item>
              <div class="d-flex align-center justify-space-between ga-2">
                <div class="text-subtitle-1 font-weight-bold">{{ plan.name }}</div>
                <v-chip color="primary" size="small" variant="tonal">{{ plan.code }}</v-chip>
              </div>
              <div class="text-body-2 text-medium-emphasis mt-2">
                {{ plan.description || 'Plano sem descricao' }}
              </div>
            </v-card-item>

            <v-card-text>
              <div class="text-h5 font-weight-bold mb-2">
                {{ formatCurrency(plan.monthlyPrice, plan.currency) }}/mes
              </div>
              <div class="text-caption text-medium-emphasis">
                Limites: usuarios {{ plan.maxUsers ?? 'Ilimitado' }}, veiculos
                {{ plan.maxVehicles ?? 'Ilimitado' }}, entregas
                {{ plan.maxShipments ?? 'Ilimitado' }}.
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
                {{ canCheckout ? 'Assinar plano' : 'Sem permissao para contratar' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-alert v-if="plans.length === 0 && !loading" type="info" variant="tonal">
        Nenhum plano disponivel para exibicao no momento.
      </v-alert>
    </v-card-text>
  </v-card>

  <v-row>
    <v-col cols="12" xl="7">
      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Historico recente" title="Pagamentos" />

        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Data</th>
              <th>Valor</th>
              <th>Forma</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id">
              <td>{{ formatDate(payment.createdAt) }}</td>
              <td>{{ formatCurrency(payment.amount, payment.currency) }}</td>
              <td>{{ formatProvider(payment.provider) }}</td>
              <td>
                <StatusChip :status="payment.status.toLowerCase()" />
              </td>
            </tr>
            <tr v-if="payments.length === 0 && !loading">
              <td class="text-center text-medium-emphasis py-6" colspan="4">
                Sem pagamentos registrados para este periodo.
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>

    <v-col cols="12" xl="5">
      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Uso por indicador" title="Consumo" />

        <v-list class="bg-transparent" density="comfortable" lines="two">
          <v-list-item v-for="item in usage" :key="item.id" :title="formatMetric(item.metric)">
            <v-list-item-subtitle>
              {{ item.usageCount }} no periodo {{ formatDate(item.periodStart) }} -
              {{ formatDate(item.periodEnd) }}
            </v-list-item-subtitle>

            <template #append>
              <v-chip color="info" size="small" variant="tonal">{{ item.usageCount }}</v-chip>
            </template>
          </v-list-item>

          <v-list-item
            v-if="usage.length === 0 && !loading"
            title="Sem dados de consumo para o periodo atual."
          />
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import type { SaaSPayment, SaaSPlan, SaaSSubscription, TenantUsage } from '@/types/saas'
  import { computed, onMounted, ref } from 'vue'
  import MetricCard from '@/components/ui/MetricCard.vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import StatusChip from '@/components/ui/StatusChip.vue'
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

  const subscriptionDescription = computed(() => {
    if (!currentSubscription.value) {
      return 'Sem assinatura ativa no momento'
    }

    return `Ciclo atual ate ${formatDate(currentSubscription.value.currentPeriodEnd)}`
  })

  const renewalDescription = computed(() => {
    if (!currentSubscription.value) {
      return 'Verifique os planos disponiveis'
    }

    return `Inicio do ciclo: ${formatDate(currentSubscription.value.currentPeriodStart)}`
  })

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
        failures.push(error instanceof Error ? error.message : 'Falha ao carregar consumo.')
      }
    }

    if (failures.length > 0) {
      errorMessage.value = failures[0] ?? 'Erro ao carregar dados de assinatura.'
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
        = error instanceof ApiError
          ? error.message
          : 'Nao foi possivel iniciar o processo de assinatura.'
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

  function formatProvider (provider: SaaSPayment['provider']): string {
    if (provider === 'STRIPE') return 'Cartao / Stripe'
    return 'Interno'
  }

  function formatSubscriptionStatus (status: SaaSSubscription['status']): string {
    if (status === 'TRIALING') return 'Periodo de teste'
    if (status === 'ACTIVE') return 'Ativa'
    if (status === 'PAST_DUE') return 'Atrasada'
    if (status === 'INCOMPLETE') return 'Pendente'
    return 'Cancelada'
  }

  function formatMetric (metric: string): string {
    if (metric === 'users') return 'Usuarios ativos'
    if (metric === 'vehicles') return 'Veiculos em uso'
    if (metric === 'shipments') return 'Entregas processadas'
    return metric
  }

  onMounted(() => {
    void loadBillingData()
  })
</script>
