import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import vuetify from '@/plugins/vuetify'
import { configureHttpClient } from '@/core/http/client'
import { useAuthStore } from '@/stores/auth'
import App from './App.vue'
import 'unfonts.css'
import '@/styles/main.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

const auth = useAuthStore(pinia)

configureHttpClient({
  getAccessToken: () => auth.accessToken,
  onUnauthorized: () => {
    auth.handleUnauthorized()

    if (router.currentRoute.value.name !== 'login') {
      void router.push({
        name: 'login',
        query: {
          reason: 'session-expired',
        },
      })
    }
  },
})

void auth.initialize()

app.mount('#app')
