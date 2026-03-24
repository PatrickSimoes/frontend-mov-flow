<template>
  <div v-if="report">
    <AppPageHeader :subtitle="`Consulta analítica via ${report.endpoint}`" :title="report.title">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-refresh" @click="fetchReport">Atualizar</v-btn>
      </template>
    </AppPageHeader>

    <v-card class="mb-5" rounded="xl" variant="flat">
      <v-card-title class="text-subtitle-1">Filtros</v-card-title>
      <v-card-text>
        <AppDynamicFields
          :fields="report.filters.map(toFormField)"
          :model-value="filterModel"
          @update:model-value="updateFilterModel"
        />

        <div class="d-flex justify-end ga-2 mt-2">
          <v-btn variant="outlined" @click="reset">Limpar</v-btn>
          <v-btn color="primary" prepend-icon="mdi-filter" @click="fetchReport">Aplicar</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
      {{ errorMessage }}
    </v-alert>

    <AppDataTable
      :headers="headers"
      :items="rows"
      :items-per-page="25"
      :loading="loading"
      :page="1"
      :total-items="rows.length"
    >
      <template #empty>
        <AppEmptyState
          description="Aplique filtros para consultar o relatório."
          title="Sem dados para os filtros atuais"
        />
      </template>

      <template v-for="header in headers" :key="header.key" #[`cell-${header.key}`]="{ item }">
        <AppStatusChip v-if="isStatusValue(item[header.key])" :value="item[header.key]" />
        <span v-else>{{ renderValue(item[header.key]) }}</span>
      </template>
    </AppDataTable>
  </div>

  <v-alert v-else type="error" variant="tonal">
    Relatório não encontrado: {{ reportKey }}.
  </v-alert>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { apiClient } from '@/core/http/client'
import { compactQuery, normalizeListPayload } from '@/core/utils/http'
import { formatDate, formatDateTime, formatMoney } from '@/core/utils/formatters'
import { getReportByKey } from '@/modules/registry/resources'
import type { FilterDef, FormField } from '@/modules/registry/types'
import AppDataTable from '@/shared/components/AppDataTable.vue'
import AppDynamicFields from '@/shared/components/AppDynamicFields.vue'
import AppEmptyState from '@/shared/components/AppEmptyState.vue'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'
import AppStatusChip from '@/shared/components/AppStatusChip.vue'

type Row = Record<string, unknown>

const props = defineProps<{
  reportKey: string
}>()

const report = computed(() => getReportByKey(props.reportKey))

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const rows = ref<Row[]>([])
const filterModel = ref<Record<string, unknown>>({})

const headers = computed(() => {
  if (rows.value.length === 0) return []

  return Object.keys(rows.value[0] ?? {}).map((key) => ({
    title: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
    key,
    sortable: false,
  }))
})

function toFormField(filter: FilterDef): FormField {
  return {
    key: filter.key,
    label: filter.label,
    type: filter.type,
    options: filter.options,
  }
}

function updateFilterModel(value: Record<string, unknown>) {
  filterModel.value = value
}

function reset() {
  if (!report.value) return

  const model: Record<string, unknown> = {}
  for (const filter of report.value.filters) {
    model[filter.key] = ''
  }

  filterModel.value = model
  rows.value = []
}

function isStatusValue(value: unknown): boolean {
  if (typeof value !== 'string') return false
  return /^[A-Z_]{3,}$/.test(value)
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-'

  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : formatMoney(value, 'BRL')
  }

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDateTime(value)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return formatDate(value)
    return value
  }

  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'

  return JSON.stringify(value)
}

async function fetchReport() {
  if (!report.value) return

  loading.value = true
  errorMessage.value = null

  try {
    const payload = await apiClient.get<unknown>(
      report.value.endpoint,
      compactQuery(filterModel.value),
    )

    if (Array.isArray(payload)) {
      rows.value = payload as Row[]
      return
    }

    const parsed = normalizeListPayload<Row>(payload)
    if (parsed.items.length > 0) {
      rows.value = parsed.items
      return
    }

    if (payload && typeof payload === 'object') {
      rows.value = [payload as Row]
    } else {
      rows.value = []
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao carregar relatório.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

reset()
</script>
