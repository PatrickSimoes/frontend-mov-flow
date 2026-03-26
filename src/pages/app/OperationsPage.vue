<template>
  <PageHeader
    eyebrow="Operacao"
    subtitle="Monitore pedidos, entregas e recursos de frota com foco no que precisa de acao imediata."
    title="Operacao"
  >
    <template #actions>
      <v-btn color="primary" prepend-icon="mdi-plus" variant="flat">Novo pedido</v-btn>
      <v-btn prepend-icon="mdi-filter-outline" variant="outlined">Filtros avancados</v-btn>
    </template>
  </PageHeader>

  <v-row class="mb-2">
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Aguardando confirmacao"
        icon="mdi-clipboard-list-outline"
        label="Pedidos abertos"
        value="24"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Em rota neste momento"
        icon="mdi-truck-delivery-outline"
        icon-color="secondary"
        label="Entregas em andamento"
        value="12"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Com disponibilidade imediata"
        icon="mdi-truck-check-outline"
        icon-color="success"
        label="Veiculos disponiveis"
        value="17"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Precisam de revisao hoje"
        icon="mdi-alert-circle-outline"
        icon-color="warning"
        label="Ocorrencias"
        value="5"
      />
    </v-col>
  </v-row>

  <v-card class="surface-card mb-4" variant="flat">
    <v-card-text class="py-4">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.trim="search"
            clearable
            label="Buscar por codigo, cliente ou responsavel"
            prepend-inner-icon="mdi-magnify"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="statusFilter" :items="statusFilterItems" label="Status" />
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="unitFilter" :items="unitFilterItems" label="Unidade" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card class="surface-card" variant="flat">
    <v-tabs v-model="activeTab" bg-color="surface" color="primary" fixed-tabs>
      <v-tab value="orders">Pedidos</v-tab>
      <v-tab value="deliveries">Entregas</v-tab>
      <v-tab value="fleet">Frota</v-tab>
    </v-tabs>

    <v-divider />

    <v-window v-model="activeTab">
      <v-window-item value="orders">
        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Previsao</th>
              <th>Responsavel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="font-weight-medium">{{ order.code }}</td>
              <td>{{ order.customer }}</td>
              <td>{{ order.eta }}</td>
              <td>{{ order.owner }}</td>
              <td>
                <StatusChip :status="order.status" />
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Nenhum pedido encontrado com os filtros atuais.
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-window-item>

      <v-window-item value="deliveries">
        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Entrega</th>
              <th>Rota</th>
              <th>Motorista</th>
              <th>Janela</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="delivery in filteredDeliveries" :key="delivery.id">
              <td class="font-weight-medium">{{ delivery.code }}</td>
              <td>{{ delivery.route }}</td>
              <td>{{ delivery.driver }}</td>
              <td>{{ delivery.window }}</td>
              <td>
                <StatusChip :status="delivery.status" />
              </td>
            </tr>
            <tr v-if="filteredDeliveries.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Nenhuma entrega encontrada com os filtros atuais.
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-window-item>

      <v-window-item value="fleet">
        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Veiculo</th>
              <th>Tipo</th>
              <th>Motorista</th>
              <th>Disponibilidade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vehicle in filteredFleet" :key="vehicle.id">
              <td class="font-weight-medium">{{ vehicle.plate }}</td>
              <td>{{ vehicle.type }}</td>
              <td>{{ vehicle.driver }}</td>
              <td>{{ vehicle.availability }}</td>
              <td>
                <StatusChip :status="vehicle.status" />
              </td>
            </tr>
            <tr v-if="filteredFleet.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Nenhum veiculo encontrado com os filtros atuais.
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import MetricCard from '@/components/ui/MetricCard.vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import StatusChip from '@/components/ui/StatusChip.vue'

  const activeTab = ref<'orders' | 'deliveries' | 'fleet'>('orders')
  const search = ref('')
  const statusFilter = ref('all')
  const unitFilter = ref('all')

  const statusFilterItems = [
    { title: 'Todos', value: 'all' },
    { title: 'Em andamento', value: 'active' },
    { title: 'Atencao', value: 'pending' },
    { title: 'Concluido', value: 'delivered' },
  ]

  const unitFilterItems = [
    { title: 'Todas as unidades', value: 'all' },
    { title: 'Matriz', value: 'matriz' },
    { title: 'Filial Sul', value: 'sul' },
  ]

  const orders = [
    {
      id: 'ord-1',
      code: '#10342',
      customer: 'Mercado Central',
      eta: 'Hoje, 18:00',
      owner: 'Equipe Sul',
      status: 'pending',
      unit: 'sul',
    },
    {
      id: 'ord-2',
      code: '#10341',
      customer: 'Industria Nova',
      eta: 'Hoje, 16:30',
      owner: 'Equipe Matriz',
      status: 'active',
      unit: 'matriz',
    },
    {
      id: 'ord-3',
      code: '#10340',
      customer: 'Atacado Lima',
      eta: 'Amanha, 09:00',
      owner: 'Equipe Sul',
      status: 'open',
      unit: 'sul',
    },
  ]

  const deliveries = [
    {
      id: 'del-1',
      code: 'ENT-884',
      route: 'SP > Campinas',
      driver: 'Joao Alves',
      window: '15:00 - 17:00',
      status: 'in_transit',
      unit: 'matriz',
    },
    {
      id: 'del-2',
      code: 'ENT-883',
      route: 'SP > Santos',
      driver: 'Paulo Silva',
      window: '14:00 - 16:00',
      status: 'pending',
      unit: 'sul',
    },
    {
      id: 'del-3',
      code: 'ENT-882',
      route: 'SP > Sorocaba',
      driver: 'Marcia Reis',
      window: '10:00 - 12:00',
      status: 'delivered',
      unit: 'matriz',
    },
  ]

  const fleet = [
    {
      id: 'flt-1',
      plate: 'BRA2E19',
      type: 'Truck',
      driver: 'Carlos Mendes',
      availability: 'Livre em 2h',
      status: 'active',
      unit: 'matriz',
    },
    {
      id: 'flt-2',
      plate: 'QWE5D43',
      type: 'Van',
      driver: 'Fernanda Luz',
      availability: 'Em rota',
      status: 'in_transit',
      unit: 'sul',
    },
    {
      id: 'flt-3',
      plate: 'HJK7A88',
      type: 'Truck',
      driver: 'Sem motorista',
      availability: 'Manutencao programada',
      status: 'pending',
      unit: 'matriz',
    },
  ]

  const normalizedSearch = computed(() => search.value.trim().toLowerCase())

  function matchFilters (status: string, unit: string, searchableText: string): boolean {
    const matchesStatus
      = statusFilter.value === 'all' || status.toLowerCase().includes(statusFilter.value)
    const matchesUnit = unitFilter.value === 'all' || unit === unitFilter.value
    const matchesSearch
      = normalizedSearch.value.length === 0
        || searchableText.toLowerCase().includes(normalizedSearch.value)

    return matchesStatus && matchesUnit && matchesSearch
  }

  const filteredOrders = computed(() => {
    return orders.filter(order =>
      matchFilters(order.status, order.unit, `${order.code} ${order.customer} ${order.owner}`),
    )
  })

  const filteredDeliveries = computed(() => {
    return deliveries.filter(delivery =>
      matchFilters(
        delivery.status,
        delivery.unit,
        `${delivery.code} ${delivery.route} ${delivery.driver}`,
      ),
    )
  })

  const filteredFleet = computed(() => {
    return fleet.filter(vehicle =>
      matchFilters(
        vehicle.status,
        vehicle.unit,
        `${vehicle.plate} ${vehicle.type} ${vehicle.driver}`,
      ),
    )
  })
</script>
