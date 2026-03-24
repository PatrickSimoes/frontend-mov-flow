<template>
  <v-dialog :model-value="open" max-width="920" persistent @update:model-value="onDialogUpdate">
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>{{ title }}</span>
        <v-btn icon="mdi-close" variant="text" @click="emit('close')" />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <AppDynamicFields
          :disabled="loading"
          :fields="fields"
          :model-value="modelValue"
          :options-map="optionsMap"
          @update:model-value="(value) => emit('update:modelValue', value)"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn variant="outlined" @click="emit('close')">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" @click="emit('save')">{{ confirmLabel }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { FormField, SelectOption } from '@/modules/registry/types'
import AppDynamicFields from './AppDynamicFields.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmLabel?: string
    fields: FormField[]
    modelValue: Record<string, unknown>
    optionsMap?: Record<string, SelectOption[]>
    loading?: boolean
  }>(),
  {
    confirmLabel: 'Salvar',
    optionsMap: () => ({}),
    loading: false,
  },
)

const emit = defineEmits<{
  close: []
  save: []
  'update:modelValue': [value: Record<string, unknown>]
}>()

function onDialogUpdate(open: boolean) {
  if (!open) emit('close')
}
</script>
