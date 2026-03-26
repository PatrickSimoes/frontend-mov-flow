<template>
  <PageHeader
    eyebrow="Operacao"
    subtitle="Monitore pedidos, entregas e recursos de frota com foco no que precisa de acao imediata."
    title="Operacao"
  >
    <template #actions>
      <v-btn
        color="primary"
        :loading="loading"
        prepend-icon="mdi-refresh"
        variant="flat"
        @click="loadData"
      >
        Atualizar dados
      </v-btn>
      <v-btn prepend-icon="mdi-filter-outline" variant="outlined">Filtros avancados</v-btn>
    </template>
  </PageHeader>

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
    {{ errorMessage }}
  </v-alert>

  <v-alert v-if="!hasAnyDatasetPermission" class="mb-4" type="info" variant="tonal">
    Seu perfil nao possui permissao para visualizar dados de operacao.
  </v-alert>

  <v-row class="mb-2">
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Pedidos ativos no momento"
        icon="mdi-clipboard-list-outline"
        label="Pedidos abertos"
        :value="String(openOrdersCount)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Entregas com execucao em andamento"
        icon="mdi-truck-delivery-outline"
        icon-color="secondary"
        label="Entregas em andamento"
        :value="String(deliveriesInProgressCount)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Frota pronta para alocacao"
        icon="mdi-truck-check-outline"
        icon-color="success"
        label="Veiculos disponiveis"
        :value="String(availableVehiclesCount)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Itens com risco operacional"
        icon="mdi-alert-circle-outline"
        icon-color="warning"
        label="Ocorrencias"
        :value="String(occurrencesCount)"
      />
    </v-col>
  </v-row>

  <v-card v-if="hasAnyDatasetPermission" class="surface-card mb-4" variant="flat">
    <v-card-text class="py-4">
      <v-row>
        <v-col cols="12" md="8">
          <v-text-field
            v-model.trim="search"
            clearable
            label="Buscar por pedido, cliente, rota, motorista ou placa"
            prepend-inner-icon="mdi-magnify"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="statusFilter" :items="statusFilterItems" label="Status" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card v-if="hasAnyDatasetPermission" class="surface-card" variant="flat">
    <v-tabs v-model="activeTab" bg-color="surface" color="primary" fixed-tabs>
      <v-tab v-for="tab in availableTabs" :key="tab.value" :value="tab.value">
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <v-divider />

    <v-window v-model="activeTab">
      <v-window-item value="orders">
        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Criado em</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Carregando pedidos...
              </td>
            </tr>
            <tr v-else-if="filteredOrders.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Nenhum pedido encontrado com os filtros atuais.
              </td>
            </tr>
            <tr v-for="order in filteredOrders" v-else :key="order.id">
              <td class="font-weight-medium">{{ order.code }}</td>
              <td>{{ order.customer }}</td>
              <td>{{ order.createdAt }}</td>
              <td>{{ formatCurrency(order.amount) }}</td>
              <td>
                <StatusChip :status="order.status" />
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
              <th>Pedido</th>
              <th>Rota</th>
              <th>Motorista</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Carregando entregas...
              </td>
            </tr>
            <tr v-else-if="filteredDeliveries.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Nenhuma entrega encontrada com os filtros atuais.
              </td>
            </tr>
            <tr v-for="delivery in filteredDeliveries" v-else :key="delivery.id">
              <td class="font-weight-medium">{{ delivery.code }}</td>
              <td>{{ delivery.orderNumber }}</td>
              <td>{{ delivery.route }}</td>
              <td>{{ delivery.driver }}</td>
              <td>
                <StatusChip :status="delivery.status" />
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
            <tr v-if="loading">
              <td class="text-center text-medium-emphasis py-6" colspan="5">Carregando frota...</td>
            </tr>
            <tr v-else-if="filteredFleet.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Nenhum veiculo encontrado com os filtros atuais.
              </td>
            </tr>
            <tr v-for="vehicle in filteredFleet" v-else :key="vehicle.id">
              <td class="font-weight-medium">{{ vehicle.plate }}</td>
              <td>{{ vehicle.type }}</td>
              <td>{{ vehicle.driver }}</td>
              <td>{{ vehicle.availability }}</td>
              <td>
                <StatusChip :status="vehicle.status" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup lang="ts">
  import type { Customer } from '@/types/financial'
  import type { Driver, Order, Route, Shipment, Vehicle } from '@/types/operations'
  import { computed, onMounted, ref, watch } from 'vue'
  import MetricCard from '@/components/ui/MetricCard.vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import StatusChip from '@/components/ui/StatusChip.vue'
  import { financialApi, operationsApi } from '@/services/api'
  import { ApiError } from '@/services/http'
  import { useSessionStore } from '@/stores/session'

  type TabKey = 'orders' | 'deliveries' | 'fleet'

  interface TabOption {
    value: TabKey
    title: string
  }

  interface OrderRow {
    id: string
    code: string
    customer: string
    createdAt: string
    amount: number
    status: string
  }

  interface DeliveryRow {
    id: string
    code: string
    orderNumber: string
    route: string
    driver: string
    status: string
  }

  interface FleetRow {
    id: string
    plate: string
    type: string
    driver: string
    availability: string
    status: string
  }

  const session = useSessionStore()

  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const activeTab = ref<TabKey>('orders')
  const search = ref('')
  const statusFilter = ref('all')

  const orders = ref<Order[]>([])
  const shipments = ref<Shipment[]>([])
  const vehicles = ref<Vehicle[]>([])
  const drivers = ref<Driver[]>([])
  const routes = ref<Route[]>([])
  const customers = ref<Customer[]>([])

  const canReadOrders = computed(() => session.hasPermission('orders.read'))
  const canReadShipments = computed(() => session.hasPermission('shipments.read'))
  const canReadVehicles = computed(() => session.hasPermission('vehicles.read'))
  const canReadDrivers = computed(() => session.hasPermission('drivers.read'))
  const canReadRoutes = computed(() => session.hasPermission('routes.read'))
  const canReadCustomers = computed(() => {
    return session.hasModule('financial') && session.hasPermission('financial.master.read')
  })

  const hasAnyDatasetPermission = computed(() => {
    return canReadOrders.value || canReadShipments.value || canReadVehicles.value
  })

  const availableTabs = computed<TabOption[]>(() => {
    const tabs: TabOption[] = []

    if (canReadOrders.value) {
      tabs.push({ value: 'orders', title: 'Pedidos' })
    }
    if (canReadShipments.value) {
      tabs.push({ value: 'deliveries', title: 'Entregas' })
    }
    if (canReadVehicles.value) {
      tabs.push({ value: 'fleet', title: 'Frota' })
    }

    return tabs
  })

  watch(availableTabs, nextTabs => {
    if (nextTabs.length === 0) return

    const hasSelectedTab = nextTabs.some(tab => tab.value === activeTab.value)
    if (!hasSelectedTab) {
      const firstTab = nextTabs[0]
      if (firstTab) {
        activeTab.value = firstTab.value
      }
    }
  })

  const customerById = computed(() => {
    return new Map(customers.value.map(customer => [customer.id, customer.name]))
  })

  const orderById = computed(() => {
    return new Map(orders.value.map(order => [order.id, order.orderNumber]))
  })

  const driverById = computed(() => {
    return new Map(drivers.value.map(driver => [driver.id, driver.name]))
  })

  const routeById = computed(() => {
    return new Map(
      routes.value.map(route => [
        route.id,
        `${route.name} (${route.origin} > ${route.destination})`,
      ]),
    )
  })

  const activeShipmentByVehicleId = computed(() => {
    const map = new Map<string, Shipment>()
    const activeShipments = shipments.value.filter(shipment => {
      return ['CREATED', 'ASSIGNED', 'IN_TRANSIT'].includes(shipment.status)
    })
    // eslint-disable-next-line unicorn/no-array-sort
    const prioritizedShipments = [...activeShipments].sort((left, right) => {
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    })

    for (const shipment of prioritizedShipments) {
      if (!shipment.vehicleId || map.has(shipment.vehicleId)) continue
      map.set(shipment.vehicleId, shipment)
    }

    return map
  })

  const orderRows = computed<OrderRow[]>(() => {
    return orders.value.map(order => ({
      id: order.id,
      code: order.orderNumber,
      customer: resolveCustomerName(order.customerId),
      createdAt: formatDateTime(order.createdAt),
      amount: toNumber(order.totalValue),
      status: order.status,
    }))
  })

  const deliveryRows = computed<DeliveryRow[]>(() => {
    return shipments.value.map(shipment => ({
      id: shipment.id,
      code: `SHP-${shipment.id.slice(0, 8).toUpperCase()}`,
      orderNumber: orderById.value.get(shipment.orderId) ?? `#${shipment.orderId.slice(0, 8)}`,
      route: shipment.routeId
        ? (routeById.value.get(shipment.routeId) ?? `Rota ${shipment.routeId.slice(0, 8)}`)
        : 'Nao informada',
      driver: shipment.driverId
        ? (driverById.value.get(shipment.driverId) ?? `Motorista ${shipment.driverId.slice(0, 8)}`)
        : 'Nao atribuido',
      status: shipment.status,
    }))
  })

  const fleetRows = computed<FleetRow[]>(() => {
    return vehicles.value.map(vehicle => {
      const activeShipment = activeShipmentByVehicleId.value.get(vehicle.id)
      const assignedDriverName = activeShipment?.driverId
        ? (driverById.value.get(activeShipment.driverId)
          ?? `Motorista ${activeShipment.driverId.slice(0, 8)}`)
        : 'Sem motorista'

      return {
        id: vehicle.id,
        plate: vehicle.plate,
        type: formatVehicleType(vehicle.vehicleType),
        driver: assignedDriverName,
        availability: formatVehicleAvailability(vehicle.status, Boolean(activeShipment)),
        status: vehicle.status,
      }
    })
  })

  const openOrdersCount = computed(() => {
    return orders.value.filter(order => ['OPEN', 'CONFIRMED', 'SHIPPED'].includes(order.status))
      .length
  })

  const deliveriesInProgressCount = computed(() => {
    return shipments.value.filter(shipment =>
      ['CREATED', 'ASSIGNED', 'IN_TRANSIT'].includes(shipment.status),
    ).length
  })

  const availableVehiclesCount = computed(() => {
    return fleetRows.value.filter(vehicle => vehicle.availability === 'Disponivel').length
  })

  const occurrencesCount = computed(() => {
    const canceledOrders = orders.value.filter(order => order.status === 'CANCELED').length
    const riskyShipments = shipments.value.filter(shipment => shipment.status === 'CANCELED').length
    const unavailableVehicles = vehicles.value.filter(vehicle =>
      ['MAINTENANCE', 'INACTIVE'].includes(vehicle.status),
    ).length

    return canceledOrders + riskyShipments + unavailableVehicles
  })

  const normalizedSearch = computed(() => search.value.trim().toLowerCase())

  const currentRows = computed<Array<{ status: string }>>(() => {
    if (activeTab.value === 'orders') return orderRows.value
    if (activeTab.value === 'deliveries') return deliveryRows.value
    return fleetRows.value
  })

  const statusFilterItems = computed(() => {
    const uniqueStatuses = [...new Set(currentRows.value.map(row => row.status))]

    return [
      { title: 'Todos', value: 'all' },
      ...uniqueStatuses.map(status => ({
        title: formatStatusLabel(status),
        value: status,
      })),
    ]
  })

  const filteredOrders = computed(() => {
    return orderRows.value.filter(row => {
      return matchCommonFilters(row.status, `${row.code} ${row.customer}`)
    })
  })

  const filteredDeliveries = computed(() => {
    return deliveryRows.value.filter(row => {
      return matchCommonFilters(
        row.status,
        `${row.code} ${row.orderNumber} ${row.route} ${row.driver}`,
      )
    })
  })

  const filteredFleet = computed(() => {
    return fleetRows.value.filter(row => {
      return matchCommonFilters(
        row.status,
        `${row.plate} ${row.type} ${row.driver} ${row.availability}`,
      )
    })
  })

  async function loadData () {
    loading.value = true
    errorMessage.value = null

    const failures: string[] = []

    const tasks: Promise<void>[] = []

    if (canReadOrders.value) {
      tasks.push(
        operationsApi
          .listOrders({ page: 1, limit: 100 })
          .then(result => {
            orders.value = result
          })
          .catch(error => {
            failures.push(resolveApiError(error, 'Falha ao carregar pedidos.'))
          }),
      )
    } else {
      orders.value = []
    }

    if (canReadShipments.value) {
      tasks.push(
        operationsApi
          .listShipments({ page: 1, limit: 100 })
          .then(result => {
            shipments.value = result
          })
          .catch(error => {
            failures.push(resolveApiError(error, 'Falha ao carregar entregas.'))
          }),
      )
    } else {
      shipments.value = []
    }

    if (canReadVehicles.value) {
      tasks.push(
        operationsApi
          .listVehicles({ page: 1, limit: 100 })
          .then(result => {
            vehicles.value = result
          })
          .catch(error => {
            failures.push(resolveApiError(error, 'Falha ao carregar frota.'))
          }),
      )
    } else {
      vehicles.value = []
    }

    if (canReadDrivers.value) {
      tasks.push(
        operationsApi
          .listDrivers({ page: 1, limit: 100 })
          .then(result => {
            drivers.value = result
          })
          .catch(error => {
            failures.push(resolveApiError(error, 'Falha ao carregar motoristas.'))
          }),
      )
    } else {
      drivers.value = []
    }

    if (canReadRoutes.value) {
      tasks.push(
        operationsApi
          .listRoutes({ page: 1, limit: 100 })
          .then(result => {
            routes.value = result
          })
          .catch(error => {
            failures.push(resolveApiError(error, 'Falha ao carregar rotas.'))
          }),
      )
    } else {
      routes.value = []
    }

    if (canReadCustomers.value) {
      tasks.push(
        financialApi
          .listCustomers()
          .then(result => {
            customers.value = result
          })
          .catch(error => {
            failures.push(resolveApiError(error, 'Falha ao carregar clientes.'))
          }),
      )
    } else {
      customers.value = []
    }

    await Promise.all(tasks)

    if (failures.length > 0) {
      errorMessage.value = failures[0] ?? 'Falha ao carregar dados da operacao.'
    }

    loading.value = false
  }

  function matchCommonFilters (status: string, searchableText: string): boolean {
    const matchesStatus = statusFilter.value === 'all' || status === statusFilter.value
    const matchesSearch
      = normalizedSearch.value.length === 0
        || searchableText.toLowerCase().includes(normalizedSearch.value)

    return matchesStatus && matchesSearch
  }

  function resolveCustomerName (customerId: string): string {
    return customerById.value.get(customerId) ?? `Cliente ${customerId.slice(0, 8)}`
  }

  function formatVehicleType (vehicleType: string): string {
    const labels: Record<string, string> = {
      TRUCK: 'Caminhao',
      VAN: 'Van',
      CAR: 'Carro',
      MOTORCYCLE: 'Moto',
      TRACTOR: 'Trator',
      OTHER: 'Outro',
    }

    return labels[vehicleType] ?? vehicleType
  }

  function formatVehicleAvailability (status: string, hasActiveShipment: boolean): string {
    if (status === 'MAINTENANCE') return 'Em manutencao'
    if (status === 'INACTIVE') return 'Indisponivel'
    if (hasActiveShipment) return 'Em rota'
    return 'Disponivel'
  }

  function formatStatusLabel (status: string): string {
    const labels: Record<string, string> = {
      OPEN: 'Em aberto',
      CONFIRMED: 'Confirmado',
      SHIPPED: 'Em envio',
      CLOSED: 'Fechado',
      CANCELED: 'Cancelado',
      CREATED: 'Criado',
      ASSIGNED: 'Atribuido',
      IN_TRANSIT: 'Em transito',
      DELIVERED: 'Entregue',
      ACTIVE: 'Ativo',
      MAINTENANCE: 'Em manutencao',
      INACTIVE: 'Inativo',
    }

    return labels[status] ?? status
  }

  function resolveApiError (error: unknown, fallback: string): string {
    if (error instanceof ApiError) return error.message
    if (error instanceof Error) return error.message
    return fallback
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
    }).format(value)
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
    void loadData()
  })
</script>
