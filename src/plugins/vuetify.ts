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
      elevation: 0,
    },
    VTextField: {
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VTextarea: {
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VSelect: {
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
          background: '#f4f7f2',
          surface: '#ffffff',
          'surface-variant': '#e4ebe0',
          outline: '#ced9c8',
          primary: '#196e62',
          secondary: '#d68e26',
          success: '#228b6b',
          warning: '#b97318',
          error: '#b44135',
          info: '#2f5f91',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
        },
      },
      movFlowDark: {
        dark: true,
        colors: {
          background: '#0f171a',
          surface: '#182227',
          'surface-variant': '#223038',
          outline: '#35505d',
          primary: '#33a28f',
          secondary: '#eba534',
          success: '#39b88f',
          warning: '#d38f2e',
          error: '#de6557',
          info: '#6aa3db',
          'on-primary': '#03100e',
          'on-secondary': '#2a1801',
        },
      },
    },
  },
})
