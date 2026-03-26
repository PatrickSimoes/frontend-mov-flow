import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'

export type ThemePreference = 'system' | 'light' | 'dark'

interface ThemeOption {
  value: ThemePreference
  title: string
  subtitle: string
  icon: string
}

const STORAGE_KEY = 'mov-flow.theme-preference'
const SYSTEM_QUERY = '(prefers-color-scheme: dark)'

const themeOptions: ThemeOption[] = [
  {
    value: 'system',
    title: 'Seguir sistema',
    subtitle: 'Usa o tema configurado no seu dispositivo.',
    icon: 'mdi-circle-half-full',
  },
  {
    value: 'light',
    title: 'Claro',
    subtitle: 'Visual claro para ambientes mais iluminados.',
    icon: 'mdi-white-balance-sunny',
  },
  {
    value: 'dark',
    title: 'Escuro',
    subtitle: 'Visual escuro confortavel para longas jornadas.',
    icon: 'mdi-weather-night',
  },
]

function isThemePreference (value: string): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

function getSystemPrefersDark (): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return window.matchMedia(SYSTEM_QUERY).matches
}

function readStoredPreference (): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system'
  }
  const rawValue = window.localStorage.getItem(STORAGE_KEY)?.trim().toLowerCase()
  if (!rawValue || !isThemePreference(rawValue)) {
    return 'system'
  }
  return rawValue
}

function resolveThemeName (preference: ThemePreference): 'movFlowLight' | 'movFlowDark' {
  if (preference === 'light') {
    return 'movFlowLight'
  }
  if (preference === 'dark') {
    return 'movFlowDark'
  }
  return getSystemPrefersDark() ? 'movFlowDark' : 'movFlowLight'
}

function writeStoredPreference (preference: ThemePreference) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, preference)
}

export function useThemePreference () {
  const theme = useTheme()
  const preference = ref<ThemePreference>(readStoredPreference())

  const themeName = computed(() => resolveThemeName(preference.value))
  const isDark = computed(() => themeName.value === 'movFlowDark')
  const activeOption = computed(() => {
    return themeOptions.find(option => option.value === preference.value) ?? themeOptions[0]
  })

  function applyTheme () {
    theme.global.name.value = themeName.value
  }

  function setPreference (nextPreference: ThemePreference) {
    preference.value = nextPreference
    writeStoredPreference(nextPreference)
    applyTheme()
  }

  function handleSystemThemeChange () {
    if (preference.value !== 'system') {
      return
    }
    applyTheme()
  }

  onMounted(() => {
    applyTheme()
    if (typeof window !== 'undefined') {
      window.matchMedia(SYSTEM_QUERY).addEventListener('change', handleSystemThemeChange)
    }
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.matchMedia(SYSTEM_QUERY).removeEventListener('change', handleSystemThemeChange)
    }
  })

  return {
    preference,
    themeOptions,
    themeName,
    isDark,
    activeOption,
    setPreference,
  }
}
