<template>
  <v-card class="app-table" rounded="xl" variant="flat">
    <v-data-table
      :headers="headers"
      :items="items"
      :items-per-page="itemsPerPage"
      :loading="loading"
      :page="page"
      class="bg-transparent"
      density="comfortable"
      item-value="id"
      @update:page="emit('update:page', $event)"
      @update:items-per-page="emit('update:itemsPerPage', $event)"
    >
      <template #loading>
        <v-skeleton-loader class="mx-4 my-3" type="table-row-divider@6" />
      </template>

      <template #no-data>
        <slot name="empty">
          <div class="pa-4">
            <AppEmptyState
              description="Ajuste filtros ou crie novos registros."
              title="Nenhum resultado encontrado"
            />
          </div>
        </slot>
      </template>

      <template #item.actions="{ item }">
        <slot name="actions" :item="item" />
      </template>

      <template #bottom>
        <div class="d-flex justify-end px-4 pb-3 pt-2">
          <v-pagination
            :length="pageCount"
            :model-value="page"
            rounded="circle"
            total-visible="6"
            @update:model-value="emit('update:page', $event)"
          />
        </div>
      </template>

      <template
        v-for="header in headers.filter((column) => !['actions'].includes(String(column.key)))"
        :key="String(header.key)"
        #[`item.${String(header.key)}`]="{ item }"
      >
        <slot :item="item" :name="`cell-${String(header.key)}`">
          {{ item[String(header.key)] }}
        </slot>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppEmptyState from './AppEmptyState.vue'

type Header = {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  width?: number
}

const props = withDefaults(
  defineProps<{
    headers: Header[]
    items: Record<string, unknown>[]
    loading?: boolean
    page?: number
    itemsPerPage?: number
    totalItems?: number | null
  }>(),
  {
    loading: false,
    page: 1,
    itemsPerPage: 15,
    totalItems: null,
  },
)

const emit = defineEmits<{
  'update:page': [value: number]
  'update:itemsPerPage': [value: number]
}>()

const pageCount = computed(() => {
  if (!props.totalItems || props.totalItems <= 0) {
    return Math.max(1, props.page)
  }

  return Math.max(1, Math.ceil(props.totalItems / props.itemsPerPage))
})
</script>

<style scoped>
.app-table {
  border: 1px solid rgb(var(--v-theme-surface-variant));
}
</style>
