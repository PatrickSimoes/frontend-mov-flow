<template>
  <PageHeader
    eyebrow="Visao geral"
    subtitle="Acompanhe o que precisa de atencao agora e avance nas prioridades do dia."
    title="Painel"
  >
    <template #actions>
      <v-btn
        color="primary"
        :loading="loading"
        prepend-icon="mdi-refresh"
        variant="tonal"
        @click="loadDashboardData"
      >
        Atualizar dados
      </v-btn>
      <v-btn prepend-icon="mdi-open-in-new" to="/app/operations" variant="outlined">
        Abrir operacao
      </v-btn>
    </template>
  </PageHeader>

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
    {{ errorMessage }}
  </v-alert>

  <v-alert v-if="!canReadAnyDashboardData" class="mb-4" type="info" variant="tonal">
    Seu perfil nao possui permissao para visualizar dados do painel.
  </v-alert>

  <v-row class="mb-2">
    <v-col
      v-for="metric in metrics"
      :key="metric.label"
      cols="12"
      lg="3"
      sm="6"
    >
      <MetricCard
        :description="metric.description"
        :icon="metric.icon"
        :icon-color="metric.iconColor"
        :label="metric.label"
        :value="metric.value"
      />
    </v-col>
  </v-row>

  <v-row v-if="canReadAnyDashboardData">
    <v-col cols="12" xl="8">
      <v-card class="surface-card mb-4" variant="flat">
        <v-card-item subtitle="Itens que impactam prazo e faturamento" title="Prioridades do dia" />

        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Tarefa</th>
              <th>Area</th>
              <th>Responsavel</th>
              <th>Prazo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Carregando prioridades...
              </td>
            </tr>
            <tr v-else-if="priorities.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Nenhuma prioridade critica no momento.
              </td>
            </tr>
            <tr v-for="item in priorities" v-else :key="item.id">
              <td class="font-weight-medium">{{ item.task }}</td>
              <td>{{ item.area }}</td>
              <td>{{ item.owner }}</td>
              <td>{{ item.deadline }}</td>
              <td>
                <StatusChip :status="item.status" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Visao comparativa por periodo" title="Desempenho recente" />

        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Pedidos</th>
              <th>Entregas concluidas</th>
              <th>Receita</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Carregando desempenho...
              </td>
            </tr>
            <tr v-for="row in performanceRows" v-else :key="row.period">
              <td>{{ row.period }}</td>
              <td>{{ row.orders }}</td>
              <td>{{ row.deliveries }}</td>
              <td>{{ formatCurrency(row.revenue) }}</td>
              <td>
                <StatusChip :status="row.status" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>

    <v-col cols="12" xl="4">
      <v-card class="surface-card mb-4" variant="flat">
        <v-card-item subtitle="Acoes recomendadas" title="Proximos passos" />

        <v-list class="bg-transparent" density="comfortable" lines="two">
          <v-list-item
            v-for="step in nextSteps"
            :key="step.title"
            :prepend-icon="step.icon"
            :subtitle="step.description"
            :title="step.title"
          >
            <template #append>
              <v-btn color="primary" size="small" :to="step.to" variant="text">Abrir</v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card>

      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Informacoes da sessao" title="Resumo da empresa" />
        <v-card-text>
          <div class="text-body-2 mb-2">
            Empresa: <strong>{{ session.state.tenant?.name || 'Nao identificada' }}</strong>
          </div>
          <div class="text-body-2 mb-2">
            Codigo: <strong>{{ session.state.tenant?.slug || '--' }}</strong>
          </div>
          <div class="text-body-2 mb-2">
            Usuario: <strong>{{ session.state.session?.user.name || '-' }}</strong>
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Recursos ativos: {{ enabledModulesLabel }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import type {
    CashFlowEntry,
    FinancialCashFlowReport,
    FinancialDashboardReport,
    FinancialOverdueReport,
  } from '@/types/financial'
  import type { Order, Shipment } from '@/types/operations'
  import { computed, onMounted, ref } from 'vue'
  import MetricCard from '@/components/ui/MetricCard.vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import StatusChip from '@/components/ui/StatusChip.vue'
  import { MODULE_LABELS } from '@/config/navigation'
  import { financialApi, operationsApi } from '@/services/api'
  import { ApiError } from '@/services/http'
  import { useSessionStore } from '@/stores/session'

  interface PriorityRow {
    id: string
    task: string
    area: string
    owner: string
    deadline: string
    status: string
    createdAt: string
  }

  interface PerformanceRow {
    period: string
    orders: number
    deliveries: number
    revenue: number
    status: string
  }

  const session = useSessionStore()

  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const orders = ref<Order[]>([])
  const shipments = ref<Shipment[]>([])
  const cashFlowToday = ref<CashFlowEntry[]>([])
  const financialDashboard = ref<FinancialDashboardReport | null>(null)
  const overdueReport = ref<FinancialOverdueReport | null>(null)
  const cashFlowReports = ref<Record<string, FinancialCashFlowReport | null>>({
    '7d': null,
    '30d': null,
    'month': null,
  })

  const canReadOrders = computed(() => session.hasPermission('orders.read'))
  const canReadShipments = computed(() => session.hasPermission('shipments.read'))
  const canReadCashFlow = computed(() => session.hasPermission('financial.cash-flow.read'))
  const canReadFinancialDashboard = computed(() => session.hasPermission('financial.dashboard.read'))
  const canReadFinancialReports = computed(() => session.hasPermission('financial.reports.read'))

  const canReadAnyDashboardData = computed(() => {
    return (
      canReadOrders.value
      || canReadShipments.value
      || canReadCashFlow.value
      || canReadFinancialDashboard.value
      || canReadFinancialReports.value
    )
  })

  const enabledModulesLabel = computed(() => {
    if (session.state.enabledModules.length === 0) return 'Nenhum recurso ativo'

    return session.state.enabledModules.map(moduleCode => MODULE_LABELS[moduleCode]).join(', ')
  })

  const openOrdersCount = computed(() => {
    return orders.value.filter(order => ['OPEN', 'CONFIRMED', 'SHIPPED'].includes(order.status))
      .length
  })

  const inProgressShipmentsCount = computed(() => {
    return shipments.value.filter(shipment =>
      ['CREATED', 'ASSIGNED', 'IN_TRANSIT'].includes(shipment.status),
    ).length
  })

  const criticalPendingCount = computed(() => {
    const overdueCount = overdueReport.value
      ? overdueReport.value.totals.payableCount + overdueReport.value.totals.receivableCount
      : 0
    const canceledShipments = shipments.value.filter(
      shipment => shipment.status === 'CANCELED',
    ).length

    return overdueCount + canceledShipments
  })

  const todayResult = computed(() => {
    if (cashFlowToday.value.length > 0) {
      const total = cashFlowToday.value.reduce((acc, entry) => {
        const amount = toNumber(entry.amount)
        return acc + (entry.type === 'IN' ? amount : -amount)
      }, 0)
      return total
    }

    return financialDashboard.value?.netBalance ?? 0
  })

  const metrics = computed(() => {
    return [
      {
        label: 'Pedidos em aberto',
        value: String(openOrdersCount.value),
        description: 'Pedidos ativos aguardando conclusao',
        icon: 'mdi-receipt-text-outline',
        iconColor: 'primary',
      },
      {
        label: 'Entregas em andamento',
        value: String(inProgressShipmentsCount.value),
        description: 'Viagens criadas, atribuidas ou em transito',
        icon: 'mdi-truck-delivery-outline',
        iconColor: 'secondary',
      },
      {
        label: 'Pendencias criticas',
        value: String(criticalPendingCount.value),
        description: 'Itens com risco operacional ou financeiro',
        icon: 'mdi-alert-outline',
        iconColor: 'warning',
      },
      {
        label: 'Resultado de hoje',
        value: formatCurrency(todayResult.value),
        description: 'Saldo registrado no fluxo do dia',
        icon: 'mdi-cash-check',
        iconColor: todayResult.value >= 0 ? 'success' : 'error',
      },
    ]
  })

  const priorities = computed<PriorityRow[]>(() => {
    const rows: PriorityRow[] = []

    if (overdueReport.value) {
      for (const receivable of overdueReport.value.receivables.slice(0, 3)) {
        rows.push({
          id: `receivable-${receivable.id}`,
          task: `Cobrar titulo ${receivable.documentNumber || receivable.id.slice(0, 8)}`,
          area: 'Financeiro',
          owner: 'Contas a receber',
          deadline: formatDate(receivable.dueDate),
          status: receivable.status,
          createdAt: receivable.dueDate,
        })
      }

      for (const payable of overdueReport.value.payables.slice(0, 3)) {
        rows.push({
          id: `payable-${payable.id}`,
          task: `Regularizar pagamento ${payable.documentNumber || payable.id.slice(0, 8)}`,
          area: 'Financeiro',
          owner: 'Contas a pagar',
          deadline: formatDate(payable.dueDate),
          status: payable.status,
          createdAt: payable.dueDate,
        })
      }
    }

    for (const shipment of shipments.value
    .filter(item => item.status === 'IN_TRANSIT')
    .slice(0, 3)) {
      rows.push({
        id: `shipment-${shipment.id}`,
        task: `Acompanhar entrega SHP-${shipment.id.slice(0, 8).toUpperCase()}`,
        area: 'Operacao',
        owner: 'Expedicao',
        deadline: shipment.deliveryDate ? formatDateTime(shipment.deliveryDate) : 'Sem previsao',
        status: shipment.status,
        createdAt: shipment.updatedAt,
      })
    }

    for (const order of orders.value.filter(item => item.status === 'OPEN').slice(0, 3)) {
      rows.push({
        id: `order-${order.id}`,
        task: `Confirmar pedido ${order.orderNumber}`,
        area: 'Operacao',
        owner: 'Atendimento',
        deadline: formatDateTime(order.createdAt),
        status: order.status,
        createdAt: order.createdAt,
      })
    }

    const sortedRows = [...rows]

    sortedRows.sort((left, right) => {
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    })

    return sortedRows.slice(0, 8)
  })

  const performanceRows = computed<PerformanceRow[]>(() => {
    const now = new Date()
    const sevenDaysRange = resolveDateRange(7)
    const thirtyDaysRange = resolveDateRange(30)
    const monthRange = {
      from: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: toIsoDate(now),
    }

    return [
      {
        period: 'Ultimos 7 dias',
        orders: countOrdersInRange(orders.value, sevenDaysRange.from, sevenDaysRange.to),
        deliveries: countDeliveredShipmentsInRange(
          shipments.value,
          sevenDaysRange.from,
          sevenDaysRange.to,
        ),
        revenue: cashFlowReports.value['7d']?.totalIn ?? 0,
        status: resolvePerformanceStatus(cashFlowReports.value['7d'] ?? null),
      },
      {
        period: 'Ultimos 30 dias',
        orders: countOrdersInRange(orders.value, thirtyDaysRange.from, thirtyDaysRange.to),
        deliveries: countDeliveredShipmentsInRange(
          shipments.value,
          thirtyDaysRange.from,
          thirtyDaysRange.to,
        ),
        revenue: cashFlowReports.value['30d']?.totalIn ?? 0,
        status: resolvePerformanceStatus(cashFlowReports.value['30d'] ?? null),
      },
      {
        period: 'Mes atual',
        orders: countOrdersInRange(orders.value, monthRange.from, monthRange.to),
        deliveries: countDeliveredShipmentsInRange(shipments.value, monthRange.from, monthRange.to),
        revenue: cashFlowReports.value.month?.totalIn ?? 0,
        status: resolvePerformanceStatus(cashFlowReports.value.month ?? null),
      },
    ]
  })

  const nextSteps = computed(() => {
    const steps: Array<{ title: string, description: string, icon: string, to: string }> = []

    if (criticalPendingCount.value > 0) {
      steps.push({
        title: 'Tratar pendencias criticas',
        description: 'Ha itens com risco que podem impactar caixa e nivel de servico.',
        icon: 'mdi-alert-circle-outline',
        to: '/app/financial',
      })
    }

    if (inProgressShipmentsCount.value > 0) {
      steps.push({
        title: 'Acompanhar entregas em andamento',
        description: 'Monitore viagens em transito para reduzir atrasos.',
        icon: 'mdi-truck-delivery-outline',
        to: '/app/operations',
      })
    }

    if (openOrdersCount.value > 0) {
      steps.push({
        title: 'Revisar carteira de pedidos',
        description: 'Priorize pedidos abertos e atualize o planejamento da operacao.',
        icon: 'mdi-receipt-text-outline',
        to: '/app/operations',
      })
    }

    if (steps.length === 0) {
      steps.push({
        title: 'Operacao estavel no momento',
        description: 'Indicadores sem alertas criticos. Continue monitorando o painel.',
        icon: 'mdi-check-circle-outline',
        to: '/app/dashboard',
      })
    }

    return steps
  })

  async function loadDashboardData () {
    if (!canReadAnyDashboardData.value) return

    loading.value = true
    errorMessage.value = null

    const today = toIsoDate(new Date())
    const sevenDaysRange = resolveDateRange(7)
    const thirtyDaysRange = resolveDateRange(30)
    const monthStartRange = resolveMonthRange()
    let failures: string[] = []
    let tasks: Promise<void>[] = []
    const addFailure = (message: string) => {
      failures = [...failures, message]
    }
    const addTask = (task: Promise<void>) => {
      tasks = [...tasks, task]
    }

    if (canReadOrders.value) {
      addTask(
        operationsApi
          .listOrders({ page: 1, limit: 100 })
          .then(result => {
            orders.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar pedidos do painel.'))
          }),
      )
    } else {
      orders.value = []
    }

    if (canReadShipments.value) {
      addTask(
        operationsApi
          .listShipments({ page: 1, limit: 100 })
          .then(result => {
            shipments.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar entregas do painel.'))
          }),
      )
    } else {
      shipments.value = []
    }

    if (canReadFinancialDashboard.value) {
      addTask(
        financialApi
          .getDashboardReport(monthStartRange)
          .then(result => {
            financialDashboard.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar resumo financeiro.'))
          }),
      )
    } else {
      financialDashboard.value = null
    }

    if (canReadFinancialReports.value) {
      addTask(
        financialApi
          .getOverdueReport({ ...monthStartRange, page: 1, limit: 20 })
          .then(result => {
            overdueReport.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar pendencias financeiras.'))
          }),
      )

      const cashFlowTasks: Promise<void>[] = [
        financialApi
          .getCashFlowReport(sevenDaysRange)
          .then(result => {
            cashFlowReports.value['7d'] = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar desempenho dos ultimos 7 dias.'))
          }),
        financialApi
          .getCashFlowReport(thirtyDaysRange)
          .then(result => {
            cashFlowReports.value['30d'] = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar desempenho dos ultimos 30 dias.'))
          }),
        financialApi
          .getCashFlowReport(monthStartRange)
          .then(result => {
            cashFlowReports.value.month = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar desempenho do mes atual.'))
          }),
      ]

      addTask(Promise.all(cashFlowTasks).then(() => undefined))
    } else {
      overdueReport.value = null
      cashFlowReports.value = { '7d': null, '30d': null, 'month': null }
    }

    if (canReadCashFlow.value) {
      addTask(
        financialApi
          .listCashFlow({ from: today, to: today, page: 1, limit: 100 })
          .then(result => {
            cashFlowToday.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar fluxo de caixa do dia.'))
          }),
      )
    } else {
      cashFlowToday.value = []
    }

    await Promise.all(tasks)

    if (failures.length > 0) {
      errorMessage.value = failures[0] ?? 'Falha ao carregar dados do painel.'
    }

    loading.value = false
  }

  function countOrdersInRange (items: Order[], from: string, to: string): number {
    return items.filter(order => {
      const date = toIsoDate(new Date(order.createdAt))
      return date >= from && date <= to
    }).length
  }

  function countDeliveredShipmentsInRange (items: Shipment[], from: string, to: string): number {
    return items.filter(shipment => {
      if (shipment.status !== 'DELIVERED' || !shipment.deliveryDate) return false
      const date = toIsoDate(new Date(shipment.deliveryDate))
      return date >= from && date <= to
    }).length
  }

  function resolvePerformanceStatus (report: FinancialCashFlowReport | null): string {
    if (!report) return 'info'
    if (report.balance > 0) return 'success'
    if (report.balance < 0) return 'warning'
    return 'info'
  }

  function resolveDateRange (days: number): { from: string, to: string } {
    const now = new Date()
    const from = new Date(now)
    from.setDate(now.getDate() - (days - 1))

    return {
      from: toIsoDate(from),
      to: toIsoDate(now),
    }
  }

  function resolveMonthRange (): { from: string, to: string } {
    const now = new Date()

    return {
      from: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: toIsoDate(now),
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

  function toNumber (value: unknown): number {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  function formatCurrency (value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(toNumber(value))
  }

  function formatDate (value: string): string {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('pt-BR')
  }

  function formatDateTime (value: string): string {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  onMounted(() => {
    void loadDashboardData()
  })
</script>
