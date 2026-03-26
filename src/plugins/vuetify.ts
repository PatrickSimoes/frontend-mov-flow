import { createVuetify } from 'vuetify'
import { movFlowComponentDefaults, movFlowThemes } from '@/theme/vuetify-theme'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  defaults: movFlowComponentDefaults,
  theme: {
    defaultTheme: 'movFlowLight',
    themes: movFlowThemes,
  },
})
