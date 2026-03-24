<template>
  <v-dialog :model-value="open" max-width="760" persistent @update:model-value="onDialogUpdate">
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>{{ title }}</span>
        <v-btn icon="mdi-close" variant="text" @click="emit('close')" />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <p v-if="description" class="text-body-2 text-medium-emphasis mb-4">{{ description }}</p>

        <AppDynamicFields
          v-if="fields.length"
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
        <v-btn :color="color" :loading="loading" @click="emit('confirm')">{{ confirmLabel }}</v-btn>
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
    description?: string
    confirmLabel?: string
    color?: 'primary' | 'secondary' | 'warning' | 'error' | 'info' | 'success'
    fields: FormField[]
    modelValue: Record<string, unknown>
    optionsMap?: Record<string, SelectOption[]>
    loading?: boolean
  }>(),
  {
    description: '',
    confirmLabel: 'Confirmar',
    color: 'primary',
    optionsMap: () => ({}),
    loading: false,
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
  'update:modelValue': [value: Record<string, unknown>]
}>()

function onDialogUpdate(open: boolean) {
  if (!open) emit('close')
}
</script>
