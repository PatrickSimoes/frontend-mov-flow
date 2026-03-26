import type { ThemeDefinition } from 'vuetify'

export const movFlowComponentDefaults = {
  VAppBar: {
    elevation: 0,
  },
  VBtn: {
    rounded: 'lg',
    style: 'text-transform: none; letter-spacing: 0.01em; font-weight: 600;',
  },
  VCard: {
    rounded: 'lg',
    elevation: 0,
  },
  VChip: {
    rounded: 'pill',
  },
  VDialog: {
    maxWidth: 680,
  },
  VSelect: {
    variant: 'outlined',
    density: 'comfortable',
    hideDetails: 'auto',
  },
  VTextField: {
    variant: 'outlined',
    density: 'comfortable',
    hideDetails: 'auto',
  },
  VTextarea: {
    variant: 'outlined',
    density: 'comfortable',
    hideDetails: 'auto',
  },
}

export const movFlowLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    'primary': '#2563eb',
    'secondary': '#0f766e',
    'success': '#15803d',
    'warning': '#b45309',
    'error': '#b91c1c',
    'info': '#0369a1',
    'background': '#f4f7fb',
    'surface': '#ffffff',
    'surface-variant': '#eef2f8',
    'border': '#d7deea',
    'divider': '#e4e9f2',
    'text-primary': '#111827',
    'text-secondary': '#5b6475',
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
    'on-success': '#ffffff',
    'on-warning': '#ffffff',
    'on-error': '#ffffff',
    'on-surface': '#111827',
    'on-background': '#111827',
  },
}

export const movFlowDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    'primary': '#60a5fa',
    'secondary': '#2dd4bf',
    'success': '#4ade80',
    'warning': '#fbbf24',
    'error': '#f87171',
    'info': '#38bdf8',
    'background': '#0f172a',
    'surface': '#111b2f',
    'surface-variant': '#16233a',
    'border': '#27334a',
    'divider': '#233049',
    'text-primary': '#e5e7eb',
    'text-secondary': '#9ba5ba',
    'on-primary': '#0f172a',
    'on-secondary': '#052e2b',
    'on-success': '#052e16',
    'on-warning': '#1f1300',
    'on-error': '#2a1010',
    'on-surface': '#f5f7fb',
    'on-background': '#f5f7fb',
  },
}

export const movFlowThemes = {
  movFlowLight: movFlowLightTheme,
  movFlowDark: movFlowDarkTheme,
}
