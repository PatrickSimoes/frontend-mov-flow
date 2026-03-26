<template>
  <PageHeader
    eyebrow="Financeiro"
    subtitle="Tenha visibilidade sobre caixa, vencimentos e resultados para decidir com mais seguranca."
    title="Financeiro"
  >
    <template #actions>
      <v-btn color="primary" prepend-icon="mdi-plus" variant="flat">Novo lancamento</v-btn>
      <v-btn
        prepend-icon="mdi-file-chart-outline"
        to="/app/reports"
        variant="outlined"
      >Abrir relatorios</v-btn>
    </template>
  </PageHeader>

  <v-row class="mb-2">
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Previsto para hoje"
        icon="mdi-cash-plus"
        label="A receber"
        :value="formatCurrency(42430)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Pagamentos programados"
        icon="mdi-cash-minus"
        icon-color="warning"
        label="A pagar"
        :value="formatCurrency(28150)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Saldo liquido estimado"
        icon="mdi-wallet-outline"
        icon-color="success"
        label="Resultado do dia"
        :value="formatCurrency(14280)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Titulos com atraso"
        icon="mdi-alert-circle-outline"
        icon-color="error"
        label="Pendencias"
        :value="String(overdueRows.length)"
      />
    </v-col>
  </v-row>

  <v-row>
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
            <tr v-for="row in receivableRows" :key="row.id">
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
        <v-card-item subtitle="Contas a vencer" title="Contas a pagar" />

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
            <tr v-for="row in payableRows" :key="row.id">
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
        </v-list>
      </v-card>

      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Movimentacao da semana" title="Fluxo de caixa" />

        <v-list class="bg-transparent" density="compact">
          <v-list-item v-for="entry in cashFlowRows" :key="entry.id">
            <v-list-item-title class="d-flex justify-space-between ga-3">
              <span>{{ entry.label }}</span>
              <span :class="entry.type === 'in' ? 'text-success' : 'text-error'">
                {{ entry.type === 'in' ? '+' : '-' }}{{ formatCurrency(entry.amount) }}
              </span>
            </v-list-item-title>
            <v-list-item-subtitle>{{ entry.date }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import MetricCard from '@/components/ui/MetricCard.vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import StatusChip from '@/components/ui/StatusChip.vue'

  const receivableRows = [
    {
      id: 'rec-1',
      title: 'NF 59302',
      party: 'Rede Nova Compra',
      dueDate: 'Hoje',
      amount: 12_450,
      status: 'pending',
    },
    {
      id: 'rec-2',
      title: 'NF 59291',
      party: 'Atacado Lima',
      dueDate: 'Amanha',
      amount: 9380,
      status: 'open',
    },
    {
      id: 'rec-3',
      title: 'NF 59284',
      party: 'Mercado Central',
      dueDate: '03/04',
      amount: 7060,
      status: 'active',
    },
  ]

  const payableRows = [
    {
      id: 'pay-1',
      title: 'Combustivel - semana 14',
      party: 'Posto Sul',
      dueDate: 'Hoje',
      amount: 8450,
      status: 'pending',
    },
    {
      id: 'pay-2',
      title: 'Manutencao preventiva',
      party: 'Oficina Delta',
      dueDate: 'Amanha',
      amount: 5320,
      status: 'open',
    },
    {
      id: 'pay-3',
      title: 'Licenca de rastreamento',
      party: 'TrackPro',
      dueDate: '05/04',
      amount: 2480,
      status: 'active',
    },
  ]

  const overdueRows = [
    {
      id: 'ovd-1',
      title: 'NF 59110 - Cobrar cliente',
      reason: 'Atraso de 4 dias no recebimento',
      amount: 3180,
    },
    {
      id: 'ovd-2',
      title: 'Combustivel - parcela 2',
      reason: 'Vencimento ontem sem baixa',
      amount: 2460,
    },
  ]

  const cashFlowRows = [
    { id: 'cf-1', label: 'Recebimento de pedidos', date: 'Seg, 09:12', amount: 14_800, type: 'in' },
    { id: 'cf-2', label: 'Pagamento de combustivel', date: 'Seg, 14:43', amount: 4650, type: 'out' },
    { id: 'cf-3', label: 'Recebimento de servico', date: 'Ter, 10:20', amount: 9320, type: 'in' },
    { id: 'cf-4', label: 'Pagamento de fornecedores', date: 'Ter, 17:05', amount: 5220, type: 'out' },
  ] as const

  function formatCurrency (value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value)
  }
</script>
