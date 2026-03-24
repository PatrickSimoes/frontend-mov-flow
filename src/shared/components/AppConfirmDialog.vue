<template>
  <v-dialog :model-value="confirmConfig.open" max-width="520" persistent>
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center ga-2">
        <v-icon :color="confirmConfig.tone" icon="mdi-alert-outline" />
        {{ confirmConfig.title }}
      </v-card-title>

      <v-card-text class="text-body-1">{{ confirmConfig.message }}</v-card-text>

      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn variant="outlined" @click="appShell.resolveConfirm(false)">{{
          confirmConfig.cancelText
        }}</v-btn>
        <v-btn :color="confirmConfig.tone" @click="appShell.resolveConfirm(true)">{{
          confirmConfig.confirmText
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppShellStore } from '@/stores/app-shell'

const appShell = useAppShellStore()
const { confirmConfig } = storeToRefs(appShell)
</script>
