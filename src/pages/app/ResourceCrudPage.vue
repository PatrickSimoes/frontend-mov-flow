<template>
  <div v-if="resource">
    <AppPageHeader :subtitle="resource.subtitle" :title="resource.title">
      <template #actions>
        <v-btn v-if="canCreate" color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Novo
        </v-btn>
      </template>
    </AppPageHeader>

    <v-alert v-if="resource.listDisabled" class="mb-5" type="info" variant="tonal">
      Este endpoint não possui listagem no backend. A tela suporta criação de registros.
    </v-alert>

    <v-card v-if="resource.filters?.length" class="mb-5" rounded="xl" variant="flat">
      <v-card-title class="text-subtitle-1">Filtros</v-card-title>
      <v-card-text>
        <AppDynamicFields
          :fields="resource.filters.map(toFilterField)"
          :model-value="filterModel"
          @update:model-value="updateFilterModel"
        />

        <div class="d-flex justify-end ga-2 mt-2">
          <v-btn variant="outlined" @click="resetFilters">Limpar</v-btn>
          <v-btn color="primary" prepend-icon="mdi-filter" @click="applyFilters">Aplicar</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
      {{ errorMessage }}
    </v-alert>

    <div v-if="!resource.listDisabled">
      <AppDataTable
        :headers="headers"
        :items="rows"
        :items-per-page="limit"
        :loading="loading"
        :page="page"
        :total-items="totalItems"
        @update:items-per-page="handleItemsPerPage"
        @update:page="handlePageChange"
      >
        <template #empty>
          <AppEmptyState
            description="Ajuste os filtros da consulta ou crie um novo registro."
            title="Nenhum registro encontrado"
          />
        </template>

        <template
          v-for="column in resource.columns"
          :key="column.key"
          #[`cell-${column.key}`]="{ item }"
        >
          <AppStatusChip
            v-if="column.type === 'status'"
            :value="resolveColumnValue(item, column)"
          />
          <span v-else-if="column.type === 'boolean'">
            {{ resolveColumnValue(item, column) ? 'Sim' : 'Não' }}
          </span>
          <span v-else-if="column.type === 'money'">
            {{ formatMoneyValue(item, column) }}
          </span>
          <span v-else-if="column.type === 'date'">
            {{ formatDateSafe(resolveColumnValue(item, column)) }}
          </span>
          <span v-else-if="column.type === 'datetime'">
            {{ formatDateTimeSafe(resolveColumnValue(item, column)) }}
          </span>
          <span v-else>{{ resolveColumnValue(item, column) }}</span>
        </template>

        <template #actions="{ item }">
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon="mdi-dots-vertical" size="small" variant="text" />
            </template>

            <v-list density="comfortable" min-width="250">
              <v-list-item
                v-if="canEdit"
                prepend-icon="mdi-pencil-outline"
                title="Editar"
                @click="openEditDialog(item)"
              />

              <v-list-item
                v-if="canDelete"
                prepend-icon="mdi-delete-outline"
                title="Excluir"
                @click="removeRow(item)"
              />

              <v-list-item
                v-for="action in availableCustomActions"
                :key="action.id"
                :prepend-icon="action.icon || 'mdi-play-circle-outline'"
                :title="action.label"
                @click="openCustomAction(action, item)"
              />

              <v-list-item
                v-if="resource.attachments && canViewAttachments"
                prepend-icon="mdi-paperclip"
                title="Anexos"
                @click="openAttachments(item)"
              />
            </v-list>
          </v-menu>
        </template>
      </AppDataTable>
    </div>

    <AppEntityFormDialog
      :confirm-label="formMode === 'create' ? 'Criar' : 'Salvar alterações'"
      :fields="resource.fields"
      :loading="formSaving"
      :model-value="formModel"
      :open="formOpen"
      :options-map="formOptionsMap"
      :title="formMode === 'create' ? `Novo ${resource.title}` : `Editar ${resource.title}`"
      @close="closeFormDialog"
      @save="submitForm"
      @update:model-value="updateFormModel"
    />

    <AppActionDialog
      :color="activeAction?.color || 'primary'"
      :confirm-label="activeAction?.label || 'Confirmar'"
      :description="activeAction?.confirmMessage"
      :fields="activeAction?.fields || []"
      :loading="actionSaving"
      :model-value="actionModel"
      :open="actionOpen"
      :options-map="actionOptionsMap"
      :title="activeAction ? `${activeAction.label} em ${resource.title}` : 'Ação'"
      @close="closeActionDialog"
      @confirm="submitCustomAction"
      @update:model-value="updateActionModel"
    />

    <v-dialog v-model="attachmentsOpen" max-width="860" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Anexos</span>
          <v-btn icon="mdi-close" variant="text" @click="attachmentsOpen = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-alert v-if="attachmentsError" class="mb-4" type="error" variant="tonal">
            {{ attachmentsError }}
          </v-alert>

          <v-list v-if="attachments.length > 0" class="mb-4" lines="two">
            <v-list-item
              v-for="attachment in attachments"
              :key="String(attachment.id || attachment.fileUrl || attachment.fileName)"
              prepend-icon="mdi-file-document-outline"
            >
              <v-list-item-title>{{
                attachment.fileName || attachment.name || 'Arquivo'
              }}</v-list-item-title>
              <v-list-item-subtitle>{{ attachment.fileUrl || '-' }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <AppEmptyState
            v-else-if="!attachmentsLoading"
            description="Nenhum anexo encontrado para este registro."
            title="Sem anexos"
          />

          <v-skeleton-loader v-if="attachmentsLoading" type="list-item-two-line@4" />

          <v-divider v-if="canCreateAttachments" class="my-4" />

          <div v-if="canCreateAttachments">
            <div class="text-subtitle-2 mb-2">Adicionar anexo</div>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.trim="attachmentForm.fileName"
                  label="Nome do arquivo"
                  required
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.trim="attachmentForm.fileUrl"
                  label="URL do arquivo"
                  required
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model.trim="attachmentForm.mimeType"
                  label="MIME"
                  placeholder="application/pdf"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end">
              <v-btn
                color="primary"
                :loading="attachmentsSaving"
                prepend-icon="mdi-upload"
                @click="createAttachment"
              >
                Enviar
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>

  <v-alert v-else type="error" variant="tonal">
    Recurso não encontrado: {{ resourceKey }}.
  </v-alert>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { apiClient } from '@/core/http/client'
import { ApiError } from '@/core/types/api'
import { fillPathParams, compactQuery, normalizeListPayload } from '@/core/utils/http'
import { formatDate, formatDateTime, formatMoney, getNestedValue } from '@/core/utils/formatters'
import { getResourceByKey } from '@/modules/registry/resources'
import type {
  ActionConfig,
  ColumnDef,
  FilterDef,
  FormField,
  SelectOption,
} from '@/modules/registry/types'
import { useAuthStore } from '@/stores/auth'
import { useAppShellStore } from '@/stores/app-shell'
import AppActionDialog from '@/shared/components/AppActionDialog.vue'
import AppDataTable from '@/shared/components/AppDataTable.vue'
import AppDynamicFields from '@/shared/components/AppDynamicFields.vue'
import AppEmptyState from '@/shared/components/AppEmptyState.vue'
import AppEntityFormDialog from '@/shared/components/AppEntityFormDialog.vue'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'
import AppStatusChip from '@/shared/components/AppStatusChip.vue'

type EntityRow = Record<string, unknown>

const props = defineProps<{
  resourceKey: string
}>()

const route = useRoute()
const auth = useAuthStore()
const appShell = useAppShellStore()

const resource = computed(() => getResourceByKey(props.resourceKey))

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const rows = ref<EntityRow[]>([])
const page = ref(1)
const limit = ref(15)
const totalItems = ref<number | null>(null)

const filterModel = ref<Record<string, unknown>>({})

const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formSaving = ref(false)
const formModel = ref<Record<string, unknown>>({})
const formOptionsMap = ref<Record<string, SelectOption[]>>({})

const actionOpen = ref(false)
const actionSaving = ref(false)
const actionModel = ref<Record<string, unknown>>({})
const actionOptionsMap = ref<Record<string, SelectOption[]>>({})
const activeAction = ref<ActionConfig | null>(null)

const selectedRow = ref<EntityRow | null>(null)

const attachmentsOpen = ref(false)
const attachmentsLoading = ref(false)
const attachmentsSaving = ref(false)
const attachmentsError = ref<string | null>(null)
const attachments = ref<EntityRow[]>([])
const attachmentForm = reactive({
  fileName: '',
  fileUrl: '',
  mimeType: '',
})

const routeParams = computed<Record<string, string>>(() => {
  return Object.fromEntries(
    Object.entries(route.params).map(([key, raw]) => [
      key,
      Array.isArray(raw) ? (raw[0] ?? '') : String(raw),
    ]),
  )
})

const headers = computed(() => {
  if (!resource.value) return []

  const base = resource.value.columns.map((column) => ({
    title: column.title,
    key: column.key,
    sortable: false,
    width: column.width,
  }))

  if (hasRowActions.value) {
    base.push({
      title: 'Ações',
      key: 'actions',
      sortable: false,
      width: 80,
    })
  }

  return base
})

const canCreate = computed(() => {
  if (!resource.value || resource.value.hideCreate) return false
  if (!resource.value.permissions.create) return false
  return auth.hasPermission(resource.value.permissions.create)
})

const canEdit = computed(() => {
  if (!resource.value || resource.value.hideEdit) return false
  if (!resource.value.permissions.update) return false
  return auth.hasPermission(resource.value.permissions.update)
})

const canDelete = computed(() => {
  if (!resource.value || resource.value.hideDelete) return false
  if (!resource.value.permissions.remove) return false
  return auth.hasPermission(resource.value.permissions.remove)
})

const availableCustomActions = computed(() => {
  if (!resource.value?.customActions) return []

  return resource.value.customActions.filter((action) => {
    if (!action.permission) return true
    return auth.hasPermission(action.permission)
  })
})

const canViewAttachments = computed(() => {
  if (!resource.value?.attachments) return false

  return (
    auth.hasPermission(resource.value.attachments.permissionRead) ||
    auth.hasPermission(resource.value.attachments.permissionCreate)
  )
})

const canCreateAttachments = computed(() => {
  if (!resource.value?.attachments) return false
  return auth.hasPermission(resource.value.attachments.permissionCreate)
})

const hasRowActions = computed(() => {
  return (
    canEdit.value ||
    canDelete.value ||
    availableCustomActions.value.length > 0 ||
    canViewAttachments.value
  )
})

function toFilterField(filter: FilterDef): FormField {
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

function updateFormModel(value: Record<string, unknown>) {
  formModel.value = value
}

function updateActionModel(value: Record<string, unknown>) {
  actionModel.value = value
}

function initFilters() {
  if (!resource.value) return

  const initial: Record<string, unknown> = {}
  for (const filter of resource.value.filters ?? []) {
    initial[filter.key] = ''
  }

  filterModel.value = initial
  page.value = 1
  limit.value = resource.value.defaultLimit ?? 15
}

function fillPath(path: string, id?: string): string {
  return fillPathParams(path, {
    ...routeParams.value,
    id,
  })
}

function resolveColumnValue(item: EntityRow, column: ColumnDef): unknown {
  return getNestedValue(item, column.path)
}

function formatDateSafe(value: unknown): string {
  return formatDate((value ?? null) as string | Date | null)
}

function formatDateTimeSafe(value: unknown): string {
  return formatDateTime((value ?? null) as string | Date | null)
}

function formatMoneyValue(item: EntityRow, column: ColumnDef): string {
  const value = resolveColumnValue(item, column)
  const currency = column.currencyPath
    ? String(getNestedValue(item, column.currencyPath) || 'BRL')
    : 'BRL'
  return formatMoney(value, currency)
}

async function loadFieldOptions(fields: FormField[]): Promise<Record<string, SelectOption[]>> {
  const optionEntries = await Promise.all(
    fields.map(async (field) => {
      if (!field.optionSource) return [field.key, field.options ?? []] as const

      try {
        const payload = await apiClient.get<unknown>(
          fillPath(field.optionSource.endpoint),
          field.optionSource.query,
        )

        const { items } = normalizeListPayload<EntityRow>(payload)
        const options = items.map((item) => {
          const label = getNestedValue(item, field.optionSource?.labelKey ?? 'name')
          const valuePath = field.optionSource?.valueKey ?? 'id'
          const value = getNestedValue(item, valuePath)

          return {
            label: String(label ?? value ?? '-'),
            value: (value ?? String(label ?? '')) as string,
          }
        })

        return [field.key, options] as const
      } catch {
        return [field.key, field.options ?? []] as const
      }
    }),
  )

  return Object.fromEntries(optionEntries)
}

function initModel(fields: FormField[], source?: EntityRow | null): Record<string, unknown> {
  const model: Record<string, unknown> = {}

  for (const field of fields) {
    const current = source ? (source[field.key] ?? getNestedValue(source, field.key)) : undefined

    if (current !== undefined && current !== null) {
      model[field.key] = current
    } else if (field.type === 'switch') {
      model[field.key] = false
    } else {
      model[field.key] = ''
    }
  }

  return model
}

function buildPayload(fields: FormField[], model: Record<string, unknown>) {
  const payload: Record<string, unknown> = {}

  for (const field of fields) {
    const value = model[field.key]

    if (value === '' || value === null || value === undefined) {
      continue
    }

    if (field.type === 'number') {
      payload[field.key] = Number(value)
      continue
    }

    if (field.type === 'switch') {
      payload[field.key] = Boolean(value)
      continue
    }

    payload[field.key] = value
  }

  return payload
}

function validateRequired(fields: FormField[], model: Record<string, unknown>): string | null {
  const missing = fields.find((field) => {
    if (!field.required) return false
    const value = model[field.key]
    return value === '' || value === null || value === undefined
  })

  if (!missing) return null
  return `Preencha o campo obrigatório: ${missing.label}`
}

async function loadRows() {
  if (!resource.value || resource.value.listDisabled) {
    rows.value = []
    totalItems.value = 0
    return
  }

  loading.value = true
  errorMessage.value = null

  try {
    const query = compactQuery({
      page: page.value,
      limit: limit.value,
      ...filterModel.value,
    })

    const payload = await apiClient.get<unknown>(fillPath(resource.value.basePath), query)
    const parsed = normalizeListPayload<EntityRow>(payload)

    rows.value = parsed.items

    if (parsed.total !== null) {
      totalItems.value = parsed.total
    } else {
      totalItems.value =
        (page.value - 1) * limit.value +
        parsed.items.length +
        (parsed.items.length === limit.value ? 1 : 0)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao carregar listagem.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function applyFilters() {
  page.value = 1
  await loadRows()
}

async function resetFilters() {
  initFilters()
  await loadRows()
}

async function handlePageChange(nextPage: number) {
  page.value = nextPage
  await loadRows()
}

async function handleItemsPerPage(nextLimit: number) {
  limit.value = nextLimit
  page.value = 1
  await loadRows()
}

async function openCreateDialog() {
  if (!resource.value) return

  formMode.value = 'create'
  selectedRow.value = null
  formModel.value = initModel(resource.value.fields)
  formOptionsMap.value = await loadFieldOptions(resource.value.fields)
  formOpen.value = true
}

async function openEditDialog(item: EntityRow) {
  if (!resource.value) return

  formMode.value = 'edit'
  selectedRow.value = item
  formModel.value = initModel(resource.value.fields, item)
  formOptionsMap.value = await loadFieldOptions(resource.value.fields)
  formOpen.value = true
}

function closeFormDialog() {
  formOpen.value = false
}

async function submitForm() {
  if (!resource.value) return

  const message = validateRequired(resource.value.fields, formModel.value)
  if (message) {
    appShell.notify(message, 'warning')
    return
  }

  formSaving.value = true

  try {
    const payload = buildPayload(resource.value.fields, formModel.value)

    if (formMode.value === 'create') {
      await apiClient.post(fillPath(resource.value.basePath), payload)
      appShell.notify(`${resource.value.title}: registro criado.`, 'success')
    } else {
      const id = String(selectedRow.value?.id ?? '')
      await apiClient.patch(fillPath(`${resource.value.basePath}/:id`, id), payload)
      appShell.notify(`${resource.value.title}: registro atualizado.`, 'success')
    }

    formOpen.value = false
    await loadRows()
  } catch (error) {
    appShell.notify(error instanceof Error ? error.message : 'Falha ao salvar registro.', 'error')
  } finally {
    formSaving.value = false
  }
}

async function removeRow(item: EntityRow) {
  if (!resource.value) return

  const confirmed = await appShell.askConfirm({
    title: 'Confirmar exclusão',
    message: 'Esta ação remove o registro selecionado. Deseja continuar?',
    tone: 'error',
    confirmText: 'Excluir',
  })

  if (!confirmed) return

  try {
    await apiClient.delete(fillPath(`${resource.value.basePath}/:id`, String(item.id ?? '')))
    appShell.notify('Registro removido com sucesso.', 'success')
    await loadRows()
  } catch (error) {
    appShell.notify(error instanceof Error ? error.message : 'Falha ao remover registro.', 'error')
  }
}

async function openCustomAction(action: ActionConfig, item: EntityRow) {
  selectedRow.value = item
  activeAction.value = action
  actionModel.value = initModel(action.fields ?? [])
  actionOptionsMap.value = await loadFieldOptions(action.fields ?? [])
  actionOpen.value = true
}

function closeActionDialog() {
  actionOpen.value = false
  activeAction.value = null
}

async function submitCustomAction() {
  if (!resource.value || !activeAction.value || !selectedRow.value) return

  const fields = activeAction.value.fields ?? []
  const message = validateRequired(fields, actionModel.value)
  if (message) {
    appShell.notify(message, 'warning')
    return
  }

  if (activeAction.value.confirmMessage) {
    const confirmed = await appShell.askConfirm({
      title: activeAction.value.label,
      message: activeAction.value.confirmMessage,
      tone: normalizeConfirmTone(activeAction.value.color),
    })

    if (!confirmed) return
  }

  actionSaving.value = true

  try {
    const path = fillPath(activeAction.value.path, String(selectedRow.value.id ?? ''))
    const payload = buildPayload(fields, actionModel.value)

    if (activeAction.value.method === 'PATCH') {
      await apiClient.patch(path, payload)
    } else {
      await apiClient.post(path, payload)
    }

    appShell.notify(`Ação "${activeAction.value.label}" executada com sucesso.`, 'success')
    actionOpen.value = false
    await loadRows()
  } catch (error) {
    appShell.notify(error instanceof Error ? error.message : 'Falha ao executar ação.', 'error')
  } finally {
    actionSaving.value = false
  }
}

function normalizeConfirmTone(color?: ActionConfig['color']) {
  if (color === 'error' || color === 'success' || color === 'info' || color === 'warning') {
    return color
  }

  return 'warning' as const
}

async function openAttachments(item: EntityRow) {
  if (!resource.value?.attachments) return

  selectedRow.value = item
  attachmentsOpen.value = true
  attachmentForm.fileName = ''
  attachmentForm.fileUrl = ''
  attachmentForm.mimeType = ''
  await loadAttachments()
}

async function loadAttachments() {
  if (!resource.value?.attachments || !selectedRow.value) return

  attachmentsLoading.value = true
  attachmentsError.value = null

  try {
    const payload = await apiClient.get<unknown>(
      fillPath(resource.value.attachments.listPath, String(selectedRow.value.id ?? '')),
    )

    const parsed = normalizeListPayload<EntityRow>(payload)
    attachments.value = parsed.items
  } catch (error) {
    attachmentsError.value = error instanceof Error ? error.message : 'Falha ao carregar anexos.'
    attachments.value = []
  } finally {
    attachmentsLoading.value = false
  }
}

async function createAttachment() {
  if (!resource.value?.attachments || !selectedRow.value) return

  if (!attachmentForm.fileName || !attachmentForm.fileUrl) {
    appShell.notify('Informe nome e URL do arquivo para anexar.', 'warning')
    return
  }

  attachmentsSaving.value = true

  try {
    await apiClient.post(
      fillPath(resource.value.attachments.createPath, String(selectedRow.value.id ?? '')),
      {
        fileName: attachmentForm.fileName,
        fileUrl: attachmentForm.fileUrl,
        mimeType: attachmentForm.mimeType || undefined,
      },
    )

    appShell.notify('Anexo enviado com sucesso.', 'success')
    attachmentForm.fileName = ''
    attachmentForm.fileUrl = ''
    attachmentForm.mimeType = ''
    await loadAttachments()
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Falha ao enviar anexo.'
    appShell.notify(message, 'error')
  } finally {
    attachmentsSaving.value = false
  }
}

watch(
  () => props.resourceKey,
  () => {
    initFilters()
    void loadRows()
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    void loadRows()
  },
)

onMounted(() => {
  initFilters()
})
</script>
