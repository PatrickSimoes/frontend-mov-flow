<template>
  <PageHeader
    eyebrow="Relatorios"
    subtitle="Acompanhe indicadores de desempenho e identifique onde melhorar margem, prazo e produtividade."
    title="Relatorios"
  >
    <template #actions>
      <v-btn color="primary" prepend-icon="mdi-download" variant="flat">Exportar</v-btn>
      <v-btn prepend-icon="mdi-filter-outline" variant="outlined">Filtros</v-btn>
    </template>
  </PageHeader>

  <v-card class="surface-card mb-4" variant="flat">
    <v-card-text class="py-4">
      <v-row>
        <v-col cols="12" md="4">
          <v-select v-model="period" :items="periodItems" label="Periodo" />
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="unit" :items="unitItems" label="Unidade" />
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
        description="Faturamento do periodo"
        icon="mdi-cash-multiple"
        label="Receita"
        :value="formatCurrency(286700)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Custos diretos e indiretos"
        icon="mdi-cash-minus"
        icon-color="warning"
        label="Custos"
        :value="formatCurrency(214560)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Margem media do periodo"
        icon="mdi-chart-line"
        icon-color="success"
        label="Margem"
        value="25,2%"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Indice de pontualidade"
        icon="mdi-timer-check-outline"
        icon-color="info"
        label="Entregas no prazo"
        value="92%"
      />
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" xl="8">
      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Comparativo por area" title="Indicadores-chave" />

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
            <tr v-for="indicator in indicators" :key="indicator.name">
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
  import { ref } from 'vue'
  import MetricCard from '@/components/ui/MetricCard.vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import StatusChip from '@/components/ui/StatusChip.vue'

  const period = ref('30d')
  const unit = ref('all')
  const view = ref('operational')

  const periodItems = [
    { title: 'Ultimos 7 dias', value: '7d' },
    { title: 'Ultimos 30 dias', value: '30d' },
    { title: 'Ultimos 90 dias', value: '90d' },
  ]

  const unitItems = [
    { title: 'Todas as unidades', value: 'all' },
    { title: 'Matriz', value: 'matriz' },
    { title: 'Filial Sul', value: 'sul' },
  ]

  const viewItems = [
    { title: 'Operacional', value: 'operational' },
    { title: 'Financeira', value: 'financial' },
    { title: 'Executiva', value: 'executive' },
  ]

  const indicators = [
    {
      name: 'Tempo medio de entrega',
      current: '18h',
      previous: '20h',
      delta: '-10%',
      status: 'active',
    },
    {
      name: 'Custo por entrega',
      current: 'R$ 142',
      previous: 'R$ 137',
      delta: '+3,6%',
      status: 'pending',
    },
    {
      name: 'Indice de atraso',
      current: '8%',
      previous: '11%',
      delta: '-3 p.p.',
      status: 'success',
    },
    {
      name: 'Rentabilidade por entrega',
      current: 'R$ 86',
      previous: 'R$ 79',
      delta: '+8,9%',
      status: 'active',
    },
  ]

  const recommendations = [
    {
      title: 'Revisar rotas com maior atraso',
      description: 'Rota SP > Santos representa 34% dos atrasos da semana.',
      icon: 'mdi-map-marker-path',
    },
    {
      title: 'Negociar custo de manutencao',
      description: 'Categoria com alta de 12% no periodo.',
      icon: 'mdi-wrench-outline',
    },
    {
      title: 'Antecipar cobrancas em aberto',
      description: 'Clientes com maior impacto no caixa nos proximos 5 dias.',
      icon: 'mdi-cash-clock',
    },
  ]

  function formatCurrency (value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value)
  }
</script>
