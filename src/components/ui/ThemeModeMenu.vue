<template>
  <v-menu location="bottom end" offset="8">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :aria-label="`Tema atual: ${activeOption?.title ?? 'Seguir sistema'}`"
        :icon="activeOption?.icon ?? 'mdi-circle-half-full'"
        size="small"
        variant="text"
      />
    </template>

    <v-card min-width="300">
      <v-card-item subtitle="Escolha como deseja visualizar o sistema." title="Aparencia" />

      <v-divider />

      <v-list density="comfortable" nav>
        <v-list-item
          v-for="option in themeOptions"
          :key="option.value"
          :active="preference === option.value"
          :prepend-icon="option.icon"
          @click="setPreference(option.value)"
        >
          <v-list-item-title>{{ option.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ option.subtitle }}</v-list-item-subtitle>

          <template #append>
            <v-icon
              v-if="preference === option.value"
              color="primary"
              icon="mdi-check-circle"
              size="18"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
  import { useThemePreference } from '@/composables/useThemePreference'

  const { preference, themeOptions, activeOption, setPreference } = useThemePreference()
</script>
