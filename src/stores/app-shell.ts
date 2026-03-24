import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type SnackbarTone = 'success' | 'info' | 'warning' | 'error'

type ConfirmPayload = {
  title: string
  message: string
  tone?: SnackbarTone
  confirmText?: string
  cancelText?: string
}

export const useAppShellStore = defineStore('app-shell', () => {
  const drawerOpen = ref(true)

  const snackbarOpen = ref(false)
  const snackbarText = ref('')
  const snackbarTone = ref<SnackbarTone>('info')

  const confirmOpen = ref(false)
  const confirmTitle = ref('Confirmar ação')
  const confirmMessage = ref('Tem certeza?')
  const confirmTone = ref<SnackbarTone>('warning')
  const confirmText = ref('Confirmar')
  const cancelText = ref('Cancelar')

  let confirmResolver: ((value: boolean) => void) | null = null

  function notify(message: string, tone: SnackbarTone = 'info') {
    snackbarText.value = message
    snackbarTone.value = tone
    snackbarOpen.value = true
  }

  function closeSnackbar() {
    snackbarOpen.value = false
  }

  function setDrawer(value: boolean) {
    drawerOpen.value = value
  }

  function toggleDrawer() {
    drawerOpen.value = !drawerOpen.value
  }

  function askConfirm(payload: ConfirmPayload): Promise<boolean> {
    confirmTitle.value = payload.title
    confirmMessage.value = payload.message
    confirmTone.value = payload.tone ?? 'warning'
    confirmText.value = payload.confirmText ?? 'Confirmar'
    cancelText.value = payload.cancelText ?? 'Cancelar'
    confirmOpen.value = true

    return new Promise((resolve) => {
      confirmResolver = resolve
    })
  }

  function resolveConfirm(result: boolean) {
    confirmOpen.value = false
    confirmResolver?.(result)
    confirmResolver = null
  }

  const confirmConfig = computed(() => ({
    open: confirmOpen.value,
    title: confirmTitle.value,
    message: confirmMessage.value,
    tone: confirmTone.value,
    confirmText: confirmText.value,
    cancelText: cancelText.value,
  }))

  return {
    drawerOpen,
    snackbarOpen,
    snackbarText,
    snackbarTone,
    confirmConfig,
    notify,
    closeSnackbar,
    setDrawer,
    toggleDrawer,
    askConfirm,
    resolveConfirm,
  }
})
