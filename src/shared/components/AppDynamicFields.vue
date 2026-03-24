<template>
  <v-row>
    <v-col
      v-for="field in fields"
      :key="field.key"
      cols="12"
      :md="field.type === 'textarea' ? 12 : 6"
    >
      <v-switch
        v-if="field.type === 'switch'"
        :disabled="disabled || field.readonly"
        :label="field.label"
        :model-value="Boolean(props.modelValue[field.key])"
        @update:model-value="updateField(field.key, $event)"
      />

      <v-select
        v-else-if="field.type === 'select'"
        :disabled="disabled || field.readonly"
        :hint="field.hint"
        :items="resolvedOptions(field)"
        item-title="label"
        item-value="value"
        :label="field.label"
        :model-value="props.modelValue[field.key]"
        :placeholder="field.placeholder"
        :persistent-hint="Boolean(field.hint)"
        :required="field.required"
        variant="outlined"
        @update:model-value="updateField(field.key, $event)"
      />

      <v-textarea
        v-else-if="field.type === 'textarea'"
        :disabled="disabled || field.readonly"
        :hint="field.hint"
        :label="field.label"
        :model-value="toStringValue(props.modelValue[field.key])"
        :placeholder="field.placeholder"
        :persistent-hint="Boolean(field.hint)"
        :required="field.required"
        variant="outlined"
        @update:model-value="updateField(field.key, $event)"
      />

      <v-text-field
        v-else
        :disabled="disabled || field.readonly"
        :hint="field.hint"
        :label="field.label"
        :max="field.max"
        :min="field.min"
        :model-value="props.modelValue[field.key]"
        :placeholder="field.placeholder"
        :persistent-hint="Boolean(field.hint)"
        :required="field.required"
        :step="field.step"
        :type="inputType(field.type)"
        variant="outlined"
        @update:model-value="updateField(field.key, $event)"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { FormField, SelectOption } from '@/modules/registry/types'

const props = withDefaults(
  defineProps<{
    fields: FormField[]
    modelValue: Record<string, unknown>
    optionsMap?: Record<string, SelectOption[]>
    disabled?: boolean
  }>(),
  {
    optionsMap: () => ({}),
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

function resolvedOptions(field: FormField): SelectOption[] {
  return props.optionsMap[field.key] ?? field.options ?? []
}

function inputType(fieldType: FormField['type']): string {
  if (fieldType === 'password') return 'password'
  if (fieldType === 'number') return 'number'
  if (fieldType === 'date') return 'date'
  if (fieldType === 'datetime') return 'datetime-local'
  return 'text'
}

function toStringValue(value: unknown): string {
  return value == null ? '' : String(value)
}

function updateField(key: string, value: unknown) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}
</script>
