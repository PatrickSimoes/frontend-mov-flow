<template>
  <div class="public-screen">
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card class="pa-6 auth-card" elevation="6" rounded="xl" width="520">
        <div class="text-overline text-secondary mb-2">Mov Flow</div>
        <h1 class="text-h4 font-weight-bold mb-1">Entrar no portal</h1>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Use <strong>tenantSlug</strong>, e-mail e senha para acessar o ambiente multi-tenant.
        </p>

        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model.trim="form.tenantSlug"
            label="Tenant slug"
            placeholder="empresa-abc"
            prepend-inner-icon="mdi-domain"
            required
            variant="outlined"
          />

          <v-text-field
            v-model.trim="form.email"
            label="E-mail"
            prepend-inner-icon="mdi-email-outline"
            required
            type="email"
            variant="outlined"
          />

          <v-text-field
            v-model="form.password"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            label="Senha"
            prepend-inner-icon="mdi-lock-outline"
            required
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
            {{ errorMessage }}
          </v-alert>

          <v-btn
            block
            color="primary"
            :loading="submitting"
            prepend-icon="mdi-login"
            size="large"
            type="submit"
          >
            Entrar
          </v-btn>
        </v-form>

        <div class="text-body-2 text-medium-emphasis mt-4">
          Ainda não tem tenant?
          <RouterLink class="auth-link" to="/register">Criar conta inicial</RouterLink>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ApiError } from '@/services/http'
  import { useSessionStore } from '@/stores/session'

  const router = useRouter()
  const route = useRoute()
  const session = useSessionStore()

  const form = reactive({
    tenantSlug: '',
    email: '',
    password: '',
  })

  const showPassword = ref(false)
  const submitting = ref(false)
  const errorMessage = ref<string | null>(null)

  async function handleSubmit () {
    if (!form.tenantSlug || !form.email || !form.password) {
      errorMessage.value = 'Preencha tenant, e-mail e senha.'
      return
    }

    submitting.value = true
    errorMessage.value = null

    try {
      await session.login(form)
      const redirectTarget = typeof route.query.redirect === 'string' ? route.query.redirect : '/app/dashboard'
      await router.push(redirectTarget)
    } catch (error) {
      errorMessage.value
        = error instanceof ApiError ? error.message : 'Não foi possível autenticar. Tente novamente.'
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped>
.public-screen {
  min-height: 100vh;
  background:
    radial-gradient(1200px 580px at 5% -10%, rgb(25 110 98 / 24%), transparent 65%),
    radial-gradient(1000px 520px at 95% 110%, rgb(214 142 38 / 24%), transparent 65%),
    linear-gradient(150deg, rgb(10 24 31) 0%, rgb(24 45 52) 35%, rgb(240 242 238) 100%);
}

.auth-card {
  backdrop-filter: blur(2px);
}

.auth-link {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  text-decoration: none;
}
</style>
