<template>
  <PageHeader
    eyebrow="Relatorios"
    subtitle="Acompanhe indicadores de desempenho e identifique onde melhorar margem, prazo e produtividade."
    title="Relatorios"
  >
    <template #actions>
      <v-btn
        color="primary"
        :loading="loading"
        prepend-icon="mdi-refresh"
        variant="flat"
        @click="loadReports"
      >
        Atualizar
      </v-btn>
      <v-btn prepend-icon="mdi-filter-outline" variant="outlined" @click="loadReports">
        Aplicar filtros
      </v-btn>
    </template>
  </PageHeader>

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
    {{ errorMessage }}
  </v-alert>

  <v-alert v-if="!canReadAnyReportData" class="mb-4" type="info" variant="tonal">
    Seu perfil nao possui permissao para visualizar dados de relatorios.
  </v-alert>

  <v-card v-if="canReadAnyReportData" class="surface-card mb-4" variant="flat">
    <v-card-text class="py-4">
      <v-row>
        <v-col cols="12" md="4">
          <v-select v-model="period" :items="periodItems" label="Periodo" />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="shipmentStatus"
            :items="shipmentStatusItems"
            label="Status de entrega"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="view" :items="viewItems" label="Visao" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-row class="mb-2">
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Receita consolidada no periodo"
        icon="mdi-cash-multiple"
        label="Receita"
        :value="formatCurrency(revenueValue)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Saidas e custos totais no periodo"
        icon="mdi-cash-minus"
        icon-color="warning"
        label="Custos"
        :value="formatCurrency(costValue)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Margem consolidada da operacao"
        icon="mdi-chart-line"
        icon-color="success"
        label="Margem"
        :value="`${formatPercent(marginPercent)}`"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Entregas analisadas com lucro positivo"
        icon="mdi-timer-check-outline"
        icon-color="info"
        label="Entregas lucrativas"
        :value="`${formatPercent(profitableShipmentRate)}`"
      />
    </v-col>
  </v-row>

  <v-row v-if="canReadAnyReportData">
    <v-col cols="12" xl="8">
      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Comparativo entre periodos" title="Indicadores-chave" />

        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Atual</th>
              <th>Periodo anterior</th>
              <th>Variacao</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Carregando indicadores...
              </td>
            </tr>
            <tr v-else-if="indicators.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Sem indicadores disponiveis para os filtros selecionados.
              </td>
            </tr>
            <tr v-for="indicator in indicators" v-else :key="indicator.name">
              <td class="font-weight-medium">{{ indicator.name }}</td>
              <td>{{ indicator.current }}</td>
              <td>{{ indicator.previous }}</td>
              <td>{{ indicator.delta }}</td>
              <td>
                <StatusChip :status="indicator.status" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>

    <v-col cols="12" xl="4">
      <v-card class="surface-card mb-4" variant="flat">
        <v-card-item subtitle="Sugestoes baseadas no periodo" title="Acoes recomendadas" />

        <v-list class="bg-transparent" density="comfortable" lines="two">
          <v-list-item
            v-for="recommendation in recommendations"
            :key="recommendation.title"
            :subtitle="recommendation.description"
            :title="recommendation.title"
          >
            <template #prepend>
              <v-avatar color="surface-variant" rounded="lg" size="30" variant="flat">
                <v-icon :icon="recommendation.icon" size="18" />
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>
      </v-card>

      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Acesso rapido por area" title="Atalhos" />
        <v-card-text class="d-flex flex-wrap ga-2">
          <v-btn prepend-icon="mdi-receipt-text-outline" to="/app/operations" variant="tonal">
            Pedidos
          </v-btn>
          <v-btn prepend-icon="mdi-cash-multiple" to="/app/financial" variant="tonal">
            Financeiro
          </v-btn>
          <v-btn prepend-icon="mdi-account-group-outline" to="/app/admin" variant="tonal">
            Usuarios
          </v-btn>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import type {
    FinancialCashFlowReport,
    FinancialDashboardReport,
    FinancialOverdueReport,
    ShipmentProfitabilityReport,
  } from '@/types/financial'
  import type { ShipmentStatus } from '@/types/operations'
  import { computed, onMounted, ref } from 'vue'
  import MetricCard from '@/components/ui/MetricCard.vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import StatusChip from '@/components/ui/StatusChip.vue'
  import { financialApi } from '@/services/api'
  import { ApiError } from '@/services/http'
  import { useSessionStore } from '@/stores/session'

  interface IndicatorRow {
    name: string
    current: string
    previous: string
    delta: string
    status: string
  }

  interface RecommendationRow {
    title: string
    description: string
    icon: string
  }

  const session = useSessionStore()

  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const period = ref<'7d' | '30d' | '90d'>('30d')
  const shipmentStatus = ref<ShipmentStatus>('DELIVERED')
  const view = ref<'operational' | 'financial' | 'executive'>('operational')

  const dashboardCurrent = ref<FinancialDashboardReport | null>(null)
  const dashboardPrevious = ref<FinancialDashboardReport | null>(null)
  const cashFlowCurrent = ref<FinancialCashFlowReport | null>(null)
  const cashFlowPrevious = ref<FinancialCashFlowReport | null>(null)
  const overdueCurrent = ref<FinancialOverdueReport | null>(null)
  const overduePrevious = ref<FinancialOverdueReport | null>(null)
  const shipmentProfitCurrent = ref<ShipmentProfitabilityReport | null>(null)
  const shipmentProfitPrevious = ref<ShipmentProfitabilityReport | null>(null)

  const canReadFinancialReports = computed(() => session.hasPermission('financial.reports.read'))
  const canReadDashboard = computed(() => session.hasPermission('financial.dashboard.read'))
  const canReadAnyReportData = computed(() => {
    return canReadFinancialReports.value || canReadDashboard.value
  })

  const periodItems = [
    { title: 'Ultimos 7 dias', value: '7d' },
    { title: 'Ultimos 30 dias', value: '30d' },
    { title: 'Ultimos 90 dias', value: '90d' },
  ]

  const shipmentStatusItems = [
    { title: 'Entregues', value: 'DELIVERED' },
    { title: 'Em transito', value: 'IN_TRANSIT' },
    { title: 'Atribuidas', value: 'ASSIGNED' },
    { title: 'Criadas', value: 'CREATED' },
    { title: 'Canceladas', value: 'CANCELED' },
  ]

  const viewItems = [
    { title: 'Operacional', value: 'operational' },
    { title: 'Financeira', value: 'financial' },
    { title: 'Executiva', value: 'executive' },
  ]

  const revenueValue = computed(() => {
    if (dashboardCurrent.value) return dashboardCurrent.value.receivable.total
    if (cashFlowCurrent.value) return cashFlowCurrent.value.totalIn
    return 0
  })

  const costValue = computed(() => {
    if (dashboardCurrent.value) return dashboardCurrent.value.payable.total
    if (cashFlowCurrent.value) return cashFlowCurrent.value.totalOut
    return 0
  })

  const marginPercent = computed(() => {
    const revenue = revenueValue.value
    if (revenue <= 0) return 0
    return ((revenue - costValue.value) / revenue) * 100
  })

  const profitableShipmentRate = computed(() => {
    const report = shipmentProfitCurrent.value
    if (!report || report.totals.shipmentCount === 0) return 0

    const profitableCount = report.items.filter(item => item.profit > 0).length
    return (profitableCount / report.totals.shipmentCount) * 100
  })

  const indicators = computed<IndicatorRow[]>(() => {
    const baseRows: IndicatorRow[] = [
      buildCurrencyIndicator(
        'Saldo liquido',
        resolveNetBalance(dashboardCurrent.value, cashFlowCurrent.value),
        resolveNetBalance(dashboardPrevious.value, cashFlowPrevious.value),
      ),
      buildCurrencyIndicator(
        'Receita do periodo',
        revenueValue.value,
        dashboardPrevious.value?.receivable.total ?? cashFlowPrevious.value?.totalIn ?? 0,
      ),
      buildCurrencyIndicator(
        'Custos do periodo',
        costValue.value,
        dashboardPrevious.value?.payable.total ?? cashFlowPrevious.value?.totalOut ?? 0,
      ),
      buildCountIndicator(
        'Contas vencidas',
        resolveOverdueCount(dashboardCurrent.value, overdueCurrent.value),
        resolveOverdueCount(dashboardPrevious.value, overduePrevious.value),
        true,
      ),
    ]

    if (!shipmentProfitCurrent.value && !shipmentProfitPrevious.value) {
      return baseRows
    }

    const shipmentRows: IndicatorRow[] = [
      buildCountIndicator(
        'Entregas analisadas',
        shipmentProfitCurrent.value?.totals.shipmentCount ?? 0,
        shipmentProfitPrevious.value?.totals.shipmentCount ?? 0,
      ),
      buildPercentIndicator(
        'Margem media por entrega',
        shipmentProfitCurrent.value?.totals.marginPercent ?? 0,
        shipmentProfitPrevious.value?.totals.marginPercent ?? 0,
      ),
    ]

    return [...baseRows, ...shipmentRows]
  })

  const recommendations = computed<RecommendationRow[]>(() => {
    const overdueCount = resolveOverdueCount(dashboardCurrent.value, overdueCurrent.value)
    const rows = [
      overdueCount > 0
        ? {
          title: 'Priorizar vencidos',
          description: `${overdueCount} titulos vencidos exigem acao imediata.`,
          icon: 'mdi-alert-circle-outline',
        }
        : null,
      marginPercent.value < 15
        ? {
          title: 'Revisar margem operacional',
          description: 'A margem consolidada esta abaixo da meta recomendada para o periodo.',
          icon: 'mdi-chart-line-variant',
        }
        : null,
      view.value !== 'financial' && profitableShipmentRate.value < 70
        ? {
          title: 'Avaliar rentabilidade de entregas',
          description: 'Mapeie as rotas com baixo lucro para reduzir custo por viagem.',
          icon: 'mdi-truck-fast-outline',
        }
        : null,
    ].filter((row): row is RecommendationRow => row !== null)

    if (rows.length > 0) {
      return rows
    }

    return [{
      title: 'Cenario estavel no periodo',
      description: 'Indicadores estao dentro da faixa esperada. Continue monitorando.',
      icon: 'mdi-check-circle-outline',
    }]
  })

  async function loadReports () {
    if (!canReadAnyReportData.value) return

    loading.value = true
    errorMessage.value = null

    const currentRange = resolvePeriodRange(period.value)
    const previousRange = resolvePreviousRange(currentRange)
    let failures: string[] = []
    let tasks: Promise<void>[] = []
    const addFailure = (message: string) => {
      failures = [...failures, message]
    }
    const addTask = (task: Promise<void>) => {
      tasks = [...tasks, task]
    }

    if (canReadDashboard.value) {
      addTask(
        financialApi
          .getDashboardReport(currentRange)
          .then(result => {
            dashboardCurrent.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar dashboard do periodo atual.'))
          }),
      )

      addTask(
        financialApi
          .getDashboardReport(previousRange)
          .then(result => {
            dashboardPrevious.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar dashboard do periodo anterior.'))
          }),
      )

      addTask(
        financialApi
          .getShipmentProfitability({
            ...currentRange,
            status: shipmentStatus.value,
            page: 1,
            limit: 100,
          })
          .then(result => {
            shipmentProfitCurrent.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar rentabilidade do periodo atual.'))
          }),
      )

      addTask(
        financialApi
          .getShipmentProfitability({
            ...previousRange,
            status: shipmentStatus.value,
            page: 1,
            limit: 100,
          })
          .then(result => {
            shipmentProfitPrevious.value = result
          })
          .catch(error => {
            addFailure(
              resolveApiError(error, 'Falha ao carregar rentabilidade do periodo anterior.'),
            )
          }),
      )
    } else {
      dashboardCurrent.value = null
      dashboardPrevious.value = null
      shipmentProfitCurrent.value = null
      shipmentProfitPrevious.value = null
    }

    if (canReadFinancialReports.value) {
      addTask(
        financialApi
          .getCashFlowReport(currentRange)
          .then(result => {
            cashFlowCurrent.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar fluxo de caixa atual.'))
          }),
      )

      addTask(
        financialApi
          .getCashFlowReport(previousRange)
          .then(result => {
            cashFlowPrevious.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar fluxo de caixa anterior.'))
          }),
      )

      addTask(
        financialApi
          .getOverdueReport({
            ...currentRange,
            page: 1,
            limit: 100,
          })
          .then(result => {
            overdueCurrent.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar vencidos do periodo atual.'))
          }),
      )

      addTask(
        financialApi
          .getOverdueReport({
            ...previousRange,
            page: 1,
            limit: 100,
          })
          .then(result => {
            overduePrevious.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar vencidos do periodo anterior.'))
          }),
      )
    } else {
      cashFlowCurrent.value = null
      cashFlowPrevious.value = null
      overdueCurrent.value = null
      overduePrevious.value = null
    }

    await Promise.all(tasks)

    if (failures.length > 0) {
      errorMessage.value = failures[0] ?? 'Falha ao carregar relatorios.'
    }

    loading.value = false
  }

  function resolvePeriodRange (selectedPeriod: '7d' | '30d' | '90d') {
    const days = selectedPeriod === '7d' ? 7 : (selectedPeriod === '30d' ? 30 : 90)
    const now = new Date()
    const from = new Date(now)
    from.setDate(now.getDate() - (days - 1))

    return {
      from: toIsoDate(from),
      to: toIsoDate(now),
    }
  }

  function resolvePreviousRange (currentRange: { from: string, to: string }) {
    const fromDate = new Date(currentRange.from)
    const toDate = new Date(currentRange.to)
    const dayDiff = Math.max(Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1, 1)

    const previousTo = new Date(fromDate)
    previousTo.setDate(previousTo.getDate() - 1)

    const previousFrom = new Date(previousTo)
    previousFrom.setDate(previousFrom.getDate() - (dayDiff - 1))

    return {
      from: toIsoDate(previousFrom),
      to: toIsoDate(previousTo),
    }
  }

  function resolveNetBalance (
    dashboard: FinancialDashboardReport | null,
    cashFlow: FinancialCashFlowReport | null,
  ): number {
    if (dashboard) return dashboard.netBalance
    if (cashFlow) return cashFlow.balance
    return 0
  }

  function resolveOverdueCount (
    dashboard: FinancialDashboardReport | null,
    overdue: FinancialOverdueReport | null,
  ): number {
    if (dashboard) {
      return dashboard.payable.overdueCount + dashboard.receivable.overdueCount
    }
    if (overdue) {
      return overdue.totals.payableCount + overdue.totals.receivableCount
    }
    return 0
  }

  function buildCurrencyIndicator (name: string, current: number, previous: number): IndicatorRow {
    return buildIndicator(name, current, previous, formatCurrency)
  }

  function buildPercentIndicator (name: string, current: number, previous: number): IndicatorRow {
    return buildIndicator(name, current, previous, value => `${formatPercent(value)}`)
  }

  function buildCountIndicator (
    name: string,
    current: number,
    previous: number,
    inverseStatus = false,
  ): IndicatorRow {
    const indicator = buildIndicator(name, current, previous, value => String(Math.round(value)))
    if (!inverseStatus) {
      return indicator
    }

    if (indicator.status === 'success') {
      indicator.status = 'error'
      return indicator
    }

    if (indicator.status === 'error') {
      indicator.status = 'success'
    }

    return indicator
  }

  function buildIndicator (
    name: string,
    current: number,
    previous: number,
    formatter: (value: number) => string,
  ): IndicatorRow {
    const delta = current - previous
    const deltaPercent = previous === 0 ? (current === 0 ? 0 : 100) : (delta / previous) * 100

    return {
      name,
      current: formatter(current),
      previous: formatter(previous),
      delta: `${deltaPercent >= 0 ? '+' : ''}${formatPercent(deltaPercent)}`,
      status: delta > 0 ? 'success' : (delta < 0 ? 'warning' : 'info'),
    }
  }

  function resolveApiError (error: unknown, fallback: string): string {
    if (error instanceof ApiError) return error.message
    if (error instanceof Error) return error.message
    return fallback
  }

  function toIsoDate (date: Date): string {
    return date.toISOString().slice(0, 10)
  }

  function formatCurrency (value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(Number(value) || 0)
  }

  function formatPercent (value: number): string {
    return `${(Number(value) || 0).toFixed(1)}%`
  }

  onMounted(() => {
    void loadReports()
  })
</script>
