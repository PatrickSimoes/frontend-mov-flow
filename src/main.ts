/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'
// Plugins
import { registerPlugins } from '@/plugins'
import router from '@/router'
import { configureHttpClient } from '@/services/http'
import { useSessionStore } from '@/stores/session'

// Components
import App from './App.vue'

// Styles
import 'unfonts.css'
import '@/styles/main.scss'

const app = createApp(App)
const session = useSessionStore()

registerPlugins(app)

configureHttpClient({
  getAccessToken: () => session.accessToken.value,
  onUnauthorized: () => {
    session.handleUnauthorized()

    if (router.currentRoute.value.name !== 'login') {
      router.push({ name: 'login' })
    }
  },
})

void session.initialize()

app.mount('#app')
