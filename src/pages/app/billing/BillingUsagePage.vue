<template>
  <AppPageHeader subtitle="Métricas de uso por tenant" title="Uso" />

  <v-card class="mb-5" rounded="xl" variant="flat">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field v-model="filters.from" label="De" type="date" variant="outlined" />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field v-model="filters.to" label="Até" type="date" variant="outlined" />
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

        <v-col class="d-flex align-end" cols="12" md="2">
          <v-btn block color="primary" prepend-icon="mdi-filter" @click="loadUsage">Aplicar</v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">{{
    errorMessage
  }}</v-alert>

  <AppDataTable
    :headers="headers"
    :items="usage"
    :items-per-page="filters.limit"
    :loading="loading"
    :page="1"
    :total-items="usage.length"
  >
    <template #cell-periodStart="{ item }">
      {{ formatDate(item.periodStart as string | Date | null) }}
    </template>

    <template #cell-periodEnd="{ item }">
      {{ formatDate(item.periodEnd as string | Date | null) }}
    </template>

    <template #empty>
      <AppEmptyState description="Nenhuma métrica de uso retornada." title="Sem métricas" />
    </template>
  </AppDataTable>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { apiClient } from '@/core/http/client'
import { compactQuery } from '@/core/utils/http'
import { formatDate } from '@/core/utils/formatters'
import AppDataTable from '@/shared/components/AppDataTable.vue'
import AppEmptyState from '@/shared/components/AppEmptyState.vue'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'

interface UsageMetric {
  id: string
  metric: string
  usageCount: number
  periodStart: string
  periodEnd: string
}

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const usage = ref<UsageMetric[]>([])

const filters = reactive({
  from: '',
  to: '',
  page: 1,
  limit: 20,
})

const headers = [
  { title: 'ID', key: 'id', sortable: false },
  { title: 'Métrica', key: 'metric', sortable: false },
  { title: 'Uso', key: 'usageCount', sortable: false },
  { title: 'Período início', key: 'periodStart', sortable: false },
  { title: 'Período fim', key: 'periodEnd', sortable: false },
]

async function loadUsage() {
  loading.value = true
  errorMessage.value = null

  try {
    usage.value = await apiClient.get<UsageMetric[]>('/saas/usage', compactQuery(filters))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao carregar uso.'
    usage.value = []
  } finally {
    loading.value = false
  }
}

void loadUsage()
</script>
