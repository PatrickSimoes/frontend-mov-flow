<template>
  <v-snackbar
    :color="snackbarTone"
    :model-value="snackbarOpen"
    location="top right"
    timeout="4600"
    @update:model-value="(value) => !value && closeSnackbar()"
  >
    {{ snackbarText }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppShellStore } from '@/stores/app-shell'

const appShell = useAppShellStore()
const { snackbarOpen, snackbarText, snackbarTone } = storeToRefs(appShell)
const { closeSnackbar } = appShell
</script>
