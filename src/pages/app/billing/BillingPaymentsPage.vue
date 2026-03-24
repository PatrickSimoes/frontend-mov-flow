<template>
  <AppPageHeader subtitle="Histórico de pagamentos SaaS" title="Pagamentos" />

  <v-card class="mb-5" rounded="xl" variant="flat">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            label="Status"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-text-field
            v-model.number="filters.page"
            label="Página"
            min="1"
            type="number"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-text-field
            v-model.number="filters.limit"
            label="Limite"
            min="1"
            type="number"
            variant="outlined"
          />
        </v-col>

        <v-col class="d-flex align-end" cols="12" md="5">
          <div class="d-flex ga-2 w-100 justify-end">
            <v-btn variant="outlined" @click="reset">Limpar</v-btn>
            <v-btn color="primary" prepend-icon="mdi-filter" @click="loadPayments">Aplicar</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">{{
    errorMessage
  }}</v-alert>

  <AppDataTable
    :headers="headers"
    :items="payments"
    :items-per-page="filters.limit"
    :loading="loading"
    :page="1"
    :total-items="payments.length"
  >
    <template #cell-status="{ item }">
      <AppStatusChip :value="item.status" />
    </template>

    <template #cell-amount="{ item }">
      {{ formatCurrency(Number(item.amount), String(item.currency || 'BRL')) }}
    </template>

    <template #cell-createdAt="{ item }">
      {{ formatDateTime(item.createdAt as string | Date | null) }}
    </template>

    <template #empty>
      <AppEmptyState description="Nenhum pagamento encontrado." title="Sem pagamentos" />
    </template>
  </AppDataTable>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { apiClient } from '@/core/http/client'
import { compactQuery } from '@/core/utils/http'
import { formatDateTime } from '@/core/utils/formatters'
import AppDataTable from '@/shared/components/AppDataTable.vue'
import AppEmptyState from '@/shared/components/AppEmptyState.vue'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'
import AppStatusChip from '@/shared/components/AppStatusChip.vue'

interface Payment {
  id: string
  provider: string
  amount: number
  currency: string
  status: string
  dueDate?: string | null
  paidAt?: string | null
  createdAt: string
}

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const payments = ref<Payment[]>([])

const filters = reactive({
  status: '',
  page: 1,
  limit: 20,
})

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'PENDING', value: 'PENDING' },
  { label: 'PAID', value: 'PAID' },
  { label: 'FAILED', value: 'FAILED' },
  { label: 'CANCELED', value: 'CANCELED' },
  { label: 'REFUNDED', value: 'REFUNDED' },
]

const headers = [
  { title: 'ID', key: 'id', sortable: false },
  { title: 'Provider', key: 'provider', sortable: false },
  { title: 'Valor', key: 'amount', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Criado em', key: 'createdAt', sortable: false },
]

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

function reset() {
  filters.status = ''
  filters.page = 1
  filters.limit = 20
}

async function loadPayments() {
  loading.value = true
  errorMessage.value = null

  try {
    payments.value = await apiClient.get<Payment[]>('/saas/payments', compactQuery(filters))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao carregar pagamentos.'
    payments.value = []
  } finally {
    loading.value = false
  }
}

void loadPayments()
</script>
