/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  defaults: {
    VBtn: {
      rounded: 'lg',
      style: 'text-transform: none; letter-spacing: 0.02em;',
    },
    VCard: {
      rounded: 'xl',
    },
    VTextField: {
      density: 'comfortable',
      hideDetails: 'auto',
    },
  },
  theme: {
    defaultTheme: 'movFlowLight',
    themes: {
      movFlowLight: {
        dark: false,
        colors: {
          'background': '#f3f6ef',
          'surface': '#ffffff',
          'surface-variant': '#e9efe5',
          'primary': '#196e62',
          'secondary': '#d68e26',
          'success': '#228b6b',
          'warning': '#b97318',
          'error': '#b44135',
          'info': '#2f5f91',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
        },
      },
    },
  },
})
