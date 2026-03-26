<template>
  <PageHeader
    eyebrow="Visao geral"
    subtitle="Acompanhe o que precisa de atencao agora e avance nas prioridades do dia."
    title="Painel"
  >
    <template #actions>
      <v-btn color="primary" prepend-icon="mdi-refresh" variant="tonal">Atualizar dados</v-btn>
      <v-btn
        prepend-icon="mdi-open-in-new"
        to="/app/operations"
        variant="outlined"
      >Abrir operacao</v-btn>
    </template>
  </PageHeader>

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

  <v-row>
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
            <tr v-for="item in priorities" :key="item.id">
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
        <v-card-item subtitle="Ultimos 7 dias" title="Desempenho recente" />

        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Pedidos</th>
              <th>Entregas no prazo</th>
              <th>Faturamento</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in performanceRows" :key="row.period">
              <td>{{ row.period }}</td>
              <td>{{ row.orders }}</td>
              <td>{{ row.onTimeDelivery }}%</td>
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
              <v-btn color="primary" size="small" variant="text">Abrir</v-btn>
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
  import { computed } from 'vue'
  import MetricCard from '@/components/ui/MetricCard.vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import StatusChip from '@/components/ui/StatusChip.vue'
  import { MODULE_LABELS } from '@/config/navigation'
  import { useSessionStore } from '@/stores/session'

  const session = useSessionStore()

  const metrics = [
    {
      label: 'Pedidos em aberto',
      value: '24',
      description: '6 com prioridade alta',
      icon: 'mdi-receipt-text-outline',
      iconColor: 'primary',
    },
    {
      label: 'Entregas em andamento',
      value: '12',
      description: '3 exigem acompanhamento',
      icon: 'mdi-truck-delivery-outline',
      iconColor: 'secondary',
    },
    {
      label: 'Pendencias criticas',
      value: '5',
      description: 'Bloqueios com impacto imediato',
      icon: 'mdi-alert-outline',
      iconColor: 'warning',
    },
    {
      label: 'Resultado de hoje',
      value: formatCurrency(17_850),
      description: 'Atualizado ate 17:30',
      icon: 'mdi-cash-check',
      iconColor: 'success',
    },
  ]

  const priorities = [
    {
      id: 'prio-1',
      task: 'Validar coleta do pedido #10342',
      area: 'Operacao',
      owner: 'Equipe Sul',
      deadline: 'Hoje, 18:00',
      status: 'pending',
    },
    {
      id: 'prio-2',
      task: 'Ajustar divergencia de conciliacao bancaria',
      area: 'Financeiro',
      owner: 'Ana Martins',
      deadline: 'Hoje, 17:00',
      status: 'warning',
    },
    {
      id: 'prio-3',
      task: 'Concluir cadastro de novo motorista',
      area: 'Frota',
      owner: 'Carlos Silva',
      deadline: 'Amanha, 10:00',
      status: 'active',
    },
  ]

  const performanceRows = [
    {
      period: 'Ultimos 7 dias',
      orders: 146,
      onTimeDelivery: 93,
      revenue: 124_380,
      status: 'active',
    },
    {
      period: 'Semana anterior',
      orders: 131,
      onTimeDelivery: 90,
      revenue: 113_940,
      status: 'active',
    },
    {
      period: 'Media mensal',
      orders: 612,
      onTimeDelivery: 89,
      revenue: 487_200,
      status: 'pending',
    },
  ]

  const nextSteps = [
    {
      title: 'Revisar pedidos atrasados',
      description: 'Identifique gargalos e replaneje entregas com risco.',
      icon: 'mdi-timer-alert-outline',
    },
    {
      title: 'Conferir contas a vencer',
      description: 'Evite atraso em pagamentos e mantenha o caixa equilibrado.',
      icon: 'mdi-calendar-alert',
    },
    {
      title: 'Atualizar capacidade de frota',
      description: 'Antecipe faltas de veiculo e redistribua rotas.',
      icon: 'mdi-truck-cargo-container',
    },
  ]

  const enabledModulesLabel = computed(() => {
    if (session.state.enabledModules.length === 0) return 'Nenhum recurso ativo'

    return session.state.enabledModules.map(moduleCode => MODULE_LABELS[moduleCode]).join(', ')
  })

  function formatCurrency (value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value)
  }
</script>
