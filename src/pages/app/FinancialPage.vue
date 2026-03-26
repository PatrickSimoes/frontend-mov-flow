<template>
  <PageHeader
    eyebrow="Financeiro"
    subtitle="Tenha visibilidade sobre caixa, vencimentos e resultados para decidir com mais seguranca."
    title="Financeiro"
  >
    <template #actions>
      <v-btn
        color="primary"
        :loading="loading"
        prepend-icon="mdi-refresh"
        variant="flat"
        @click="loadFinancialData"
      >
        Atualizar dados
      </v-btn>
      <v-btn prepend-icon="mdi-file-chart-outline" to="/app/reports" variant="outlined">
        Abrir relatorios
      </v-btn>
    </template>
  </PageHeader>

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
    {{ errorMessage }}
  </v-alert>

  <v-alert v-if="!hasAnyFinancialPermission" class="mb-4" type="info" variant="tonal">
    Seu perfil nao possui permissao para visualizar dados financeiros.
  </v-alert>

  <v-row class="mb-2">
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Saldo previsto de recebimentos em aberto"
        icon="mdi-cash-plus"
        label="A receber"
        :value="formatCurrency(receivableOpenValue)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Compromissos em aberto para pagamento"
        icon="mdi-cash-minus"
        icon-color="warning"
        label="A pagar"
        :value="formatCurrency(payableOpenValue)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Saldo liquido do dia com base no fluxo registrado"
        icon="mdi-wallet-outline"
        icon-color="success"
        label="Resultado do dia"
        :value="formatCurrency(dailyNetResult)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Titulos vencidos que exigem acao"
        icon="mdi-alert-circle-outline"
        icon-color="error"
        label="Pendencias"
        :value="String(overdueRows.length)"
      />
    </v-col>
  </v-row>

  <v-row v-if="hasAnyFinancialPermission">
    <v-col cols="12" xl="8">
      <v-card class="surface-card mb-4" variant="flat">
        <v-card-item subtitle="Proximos vencimentos" title="Contas a receber" />

        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Cliente</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Carregando contas a receber...
              </td>
            </tr>
            <tr v-else-if="receivableRows.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Nenhuma conta a receber encontrada para o periodo.
              </td>
            </tr>
            <tr v-for="row in receivableRows" v-else :key="row.id">
              <td class="font-weight-medium">{{ row.title }}</td>
              <td>{{ row.party }}</td>
              <td>{{ row.dueDate }}</td>
              <td>{{ formatCurrency(row.amount) }}</td>
              <td>
                <StatusChip :status="row.status" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Contas com vencimento no periodo" title="Contas a pagar" />

        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Lancamento</th>
              <th>Fornecedor</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Carregando contas a pagar...
              </td>
            </tr>
            <tr v-else-if="payableRows.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Nenhuma conta a pagar encontrada para o periodo.
              </td>
            </tr>
            <tr v-for="row in payableRows" v-else :key="row.id">
              <td class="font-weight-medium">{{ row.title }}</td>
              <td>{{ row.party }}</td>
              <td>{{ row.dueDate }}</td>
              <td>{{ formatCurrency(row.amount) }}</td>
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
        <v-card-item subtitle="Itens que precisam de acao" title="Alertas financeiros" />

        <v-list class="bg-transparent" density="comfortable" lines="two">
          <v-list-item
            v-for="item in overdueRows"
            :key="item.id"
            :subtitle="item.reason"
            :title="item.title"
          >
            <template #prepend>
              <v-avatar color="error" rounded="lg" size="30" variant="tonal">
                <v-icon icon="mdi-alert-outline" size="18" />
              </v-avatar>
            </template>
            <template #append>
              <div class="text-caption text-error font-weight-bold">
                {{ formatCurrency(item.amount) }}
              </div>
            </template>
          </v-list-item>

          <v-list-item
            v-if="!loading && overdueRows.length === 0"
            title="Nenhuma pendencia financeira no periodo selecionado."
          />
        </v-list>
      </v-card>

      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Movimentacao recente" title="Fluxo de caixa" />

        <v-list class="bg-transparent" density="compact">
          <v-list-item v-for="entry in cashFlowRows" :key="entry.id">
            <v-list-item-title class="d-flex justify-space-between ga-3">
              <span>{{ entry.label }}</span>
              <span :class="entry.type === 'IN' ? 'text-success' : 'text-error'">
                {{ entry.type === 'IN' ? '+' : '-' }}{{ formatCurrency(entry.amount) }}
              </span>
            </v-list-item-title>
            <v-list-item-subtitle>{{ entry.date }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item
            v-if="!loading && cashFlowRows.length === 0"
            title="Sem lancamentos recentes de fluxo de caixa."
          />
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import type {
    AccountsPayableEntry,
    AccountsReceivableEntry,
    CashFlowEntry,
    Customer,
    FinancialDashboardReport,
    FinancialOverdueReport,
    Supplier,
  } from '@/types/financial'
  import { computed, onMounted, ref } from 'vue'
  import MetricCard from '@/components/ui/MetricCard.vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import StatusChip from '@/components/ui/StatusChip.vue'
  import { financialApi } from '@/services/api'
  import { ApiError } from '@/services/http'
  import { useSessionStore } from '@/stores/session'

  interface FinancialRow {
    id: string
    title: string
    party: string
    dueDate: string
    amount: number
    status: string
  }

  interface OverdueAlertRow {
    id: string
    title: string
    reason: string
    amount: number
  }

  interface CashFlowRow {
    id: string
    label: string
    date: string
    amount: number
    type: 'IN' | 'OUT'
  }

  const session = useSessionStore()

  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const receivables = ref<AccountsReceivableEntry[]>([])
  const payables = ref<AccountsPayableEntry[]>([])
  const cashFlowEntries = ref<CashFlowEntry[]>([])
  const dashboardReport = ref<FinancialDashboardReport | null>(null)
  const overdueReport = ref<FinancialOverdueReport | null>(null)
  const customers = ref<Customer[]>([])
  const suppliers = ref<Supplier[]>([])

  const canReadFinancialEntries = computed(() => session.hasPermission('financial.read'))
  const canReadCashFlow = computed(() => session.hasPermission('financial.cash-flow.read'))
  const canReadDashboard = computed(() => session.hasPermission('financial.dashboard.read'))
  const canReadReports = computed(() => session.hasPermission('financial.reports.read'))
  const canReadMasterData = computed(() => session.hasPermission('financial.master.read'))

  const hasAnyFinancialPermission = computed(() => {
    return (
      canReadFinancialEntries.value
      || canReadCashFlow.value
      || canReadDashboard.value
      || canReadReports.value
    )
  })

  const customerById = computed(() => {
    return new Map(customers.value.map(customer => [customer.id, customer.name]))
  })

  const supplierById = computed(() => {
    return new Map(suppliers.value.map(supplier => [supplier.id, supplier.name]))
  })

  const dateRange = computed(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    return {
      from: toIsoDate(monthStart),
      to: toIsoDate(now),
    }
  })

  const receivableRows = computed<FinancialRow[]>(() => {
    return receivables.value.map(entry => ({
      id: entry.id,
      title: entry.documentNumber || entry.description,
      party: entry.customerId
        ? customerById.value.get(entry.customerId) || `Cliente ${entry.customerId.slice(0, 8)}`
        : 'Cliente nao informado',
      dueDate: formatDate(entry.dueDate),
      amount: toNumber(entry.amount),
      status: entry.status,
    }))
  })

  const payableRows = computed<FinancialRow[]>(() => {
    return payables.value.map(entry => ({
      id: entry.id,
      title: entry.documentNumber || entry.description,
      party: entry.supplierId
        ? supplierById.value.get(entry.supplierId) || `Fornecedor ${entry.supplierId.slice(0, 8)}`
        : 'Fornecedor nao informado',
      dueDate: formatDate(entry.dueDate),
      amount: toNumber(entry.amount),
      status: entry.status,
    }))
  })

  const overdueRows = computed<OverdueAlertRow[]>(() => {
    if (!overdueReport.value) {
      return []
    }

    const overdueReceivables = overdueReport.value.receivables.map(entry => ({
      id: `receivable-${entry.id}`,
      title: `Receber: ${entry.documentNumber || entry.description}`,
      reason: `Vencimento em ${formatDate(entry.dueDate)}`,
      amount: toNumber(entry.amount),
      dueDate: entry.dueDate,
    }))

    const overduePayables = overdueReport.value.payables.map(entry => ({
      id: `payable-${entry.id}`,
      title: `Pagar: ${entry.documentNumber || entry.description}`,
      reason: `Vencimento em ${formatDate(entry.dueDate)}`,
      amount: toNumber(entry.amount),
      dueDate: entry.dueDate,
    }))

    const combinedRows = [...overdueReceivables, ...overduePayables]
    const sortedRows = [...combinedRows]

    sortedRows.sort((left, right) => {
      return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime()
    })

    return sortedRows
      .map(({ dueDate: _dueDate, ...row }) => row)
      .slice(0, 8)
  })

  const cashFlowRows = computed<CashFlowRow[]>(() => {
    return cashFlowEntries.value.slice(0, 10).map(entry => ({
      id: entry.id,
      label: entry.description || formatCashFlowLabel(entry),
      date: formatDateTime(entry.date),
      amount: toNumber(entry.amount),
      type: entry.type,
    }))
  })

  const receivableOpenValue = computed(() => {
    if (dashboardReport.value) {
      return toNumber(dashboardReport.value.receivable.open)
    }

    return receivables.value.reduce((total, entry) => {
      return total + getReceivableOutstanding(entry)
    }, 0)
  })

  const payableOpenValue = computed(() => {
    if (dashboardReport.value) {
      return toNumber(dashboardReport.value.payable.open)
    }

    return payables.value.reduce((total, entry) => {
      return total + getPayableOutstanding(entry)
    }, 0)
  })

  const dailyNetResult = computed(() => {
    const today = toIsoDate(new Date())
    const todayEntries = cashFlowEntries.value.filter(entry => {
      return toIsoDate(new Date(entry.date)) === today
    })

    if (todayEntries.length > 0) {
      const totals = todayEntries.reduce(
        (acc, entry) => {
          const amount = toNumber(entry.amount)
          if (entry.type === 'IN') {
            acc.totalIn += amount
          } else {
            acc.totalOut += amount
          }
          return acc
        },
        { totalIn: 0, totalOut: 0 },
      )

      return totals.totalIn - totals.totalOut
    }

    return toNumber(dashboardReport.value?.netBalance)
  })

  async function loadFinancialData () {
    loading.value = true
    errorMessage.value = null

    let failures: string[] = []
    let tasks: Promise<void>[] = []
    const addFailure = (message: string) => {
      failures = [...failures, message]
    }
    const addTask = (task: Promise<void>) => {
      tasks = [...tasks, task]
    }

    if (canReadFinancialEntries.value) {
      addTask(
        financialApi
          .listAccountsReceivable({
            from: dateRange.value.from,
            to: dateRange.value.to,
            page: 1,
            limit: 20,
          })
          .then(result => {
            receivables.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar contas a receber.'))
          }),
      )

      addTask(
        financialApi
          .listAccountsPayable({
            from: dateRange.value.from,
            to: dateRange.value.to,
            page: 1,
            limit: 20,
          })
          .then(result => {
            payables.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar contas a pagar.'))
          }),
      )
    } else {
      receivables.value = []
      payables.value = []
    }

    if (canReadDashboard.value) {
      addTask(
        financialApi
          .getDashboardReport({
            from: dateRange.value.from,
            to: dateRange.value.to,
          })
          .then(result => {
            dashboardReport.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar dashboard financeiro.'))
          }),
      )
    } else {
      dashboardReport.value = null
    }

    if (canReadReports.value) {
      addTask(
        financialApi
          .getOverdueReport({
            from: dateRange.value.from,
            to: dateRange.value.to,
            page: 1,
            limit: 20,
          })
          .then(result => {
            overdueReport.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar contas vencidas.'))
          }),
      )
    } else {
      overdueReport.value = null
    }

    if (canReadCashFlow.value) {
      addTask(
        financialApi
          .listCashFlow({
            from: dateRange.value.from,
            to: dateRange.value.to,
            page: 1,
            limit: 20,
          })
          .then(result => {
            cashFlowEntries.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar fluxo de caixa.'))
          }),
      )
    } else {
      cashFlowEntries.value = []
    }

    if (canReadMasterData.value) {
      addTask(
        financialApi
          .listCustomers()
          .then(result => {
            customers.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar clientes.'))
          }),
      )

      addTask(
        financialApi
          .listSuppliers()
          .then(result => {
            suppliers.value = result
          })
          .catch(error => {
            addFailure(resolveApiError(error, 'Falha ao carregar fornecedores.'))
          }),
      )
    } else {
      customers.value = []
      suppliers.value = []
    }

    await Promise.all(tasks)

    if (failures.length > 0) {
      errorMessage.value = failures[0] ?? 'Falha ao carregar dados financeiros.'
    }

    loading.value = false
  }

  function getReceivableOutstanding (entry: AccountsReceivableEntry): number {
    const totalDue
      = toNumber(entry.amount)
        + toNumber(entry.interestAmount)
        + toNumber(entry.fineAmount)
        - toNumber(entry.discountAmount)
        - toNumber(entry.receivedAmount)

    return Math.max(totalDue, 0)
  }

  function getPayableOutstanding (entry: AccountsPayableEntry): number {
    const totalDue
      = toNumber(entry.amount)
        + toNumber(entry.interestAmount)
        + toNumber(entry.fineAmount)
        - toNumber(entry.discountAmount)
        - toNumber(entry.paidAmount)

    return Math.max(totalDue, 0)
  }

  function formatCashFlowLabel (entry: CashFlowEntry): string {
    if (entry.referenceType === 'RECEIVABLE') return 'Recebimento'
    if (entry.referenceType === 'PAYABLE') return 'Pagamento'
    return 'Transferencia'
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

  function formatCurrency (value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(toNumber(value))
  }

  onMounted(() => {
    void loadFinancialData()
  })
</script>
