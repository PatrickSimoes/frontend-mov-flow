<template>
  <div class="public-screen">
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card class="pa-6 auth-card" elevation="6" rounded="xl" width="560">
        <div class="text-overline text-secondary mb-2">Onboarding</div>
        <h1 class="text-h4 font-weight-bold mb-1">Criar tenant inicial</h1>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Este cadastro cria o tenant e provisiona o usuário owner com permissões administrativas.
        </p>

        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model.trim="form.tenantName"
            label="Nome da empresa"
            prepend-inner-icon="mdi-office-building-outline"
            required
            variant="outlined"
          />

          <v-text-field
            v-model.trim="form.name"
            label="Nome do responsável"
            prepend-inner-icon="mdi-account-outline"
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
            hint="Mínimo de 8 caracteres"
            label="Senha"
            persistent-hint
            prepend-inner-icon="mdi-lock-outline"
            required
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-text-field
            v-model="confirmPassword"
            label="Confirmar senha"
            prepend-inner-icon="mdi-lock-check-outline"
            required
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
          />

          <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
            {{ errorMessage }}
          </v-alert>

          <v-btn
            block
            color="primary"
            :loading="submitting"
            prepend-icon="mdi-account-plus-outline"
            size="large"
            type="submit"
          >
            Criar tenant e entrar
          </v-btn>
        </v-form>

        <div class="text-body-2 text-medium-emphasis mt-4">
          Já possui acesso?
          <RouterLink class="auth-link" to="/login">Entrar</RouterLink>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ApiError } from '@/services/http'
  import { useSessionStore } from '@/stores/session'

  const router = useRouter()
  const session = useSessionStore()

  const form = reactive({
    tenantName: '',
    name: '',
    email: '',
    password: '',
  })

  const confirmPassword = ref('')
  const showPassword = ref(false)
  const submitting = ref(false)
  const errorMessage = ref<string | null>(null)

  async function handleSubmit () {
    if (!form.tenantName || !form.name || !form.email || !form.password) {
      errorMessage.value = 'Preencha todos os campos obrigatórios.'
      return
    }

    if (form.password.length < 8) {
      errorMessage.value = 'A senha precisa ter pelo menos 8 caracteres.'
      return
    }

    if (form.password !== confirmPassword.value) {
      errorMessage.value = 'As senhas não conferem.'
      return
    }

    submitting.value = true
    errorMessage.value = null

    try {
      await session.register(form)
      await router.push('/app/dashboard')
    } catch (error) {
      errorMessage.value
        = error instanceof ApiError ? error.message : 'Não foi possível concluir o cadastro.'
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped>
.public-screen {
  min-height: 100vh;
  background:
    radial-gradient(1000px 480px at 10% 0%, rgb(214 142 38 / 24%), transparent 65%),
    radial-gradient(900px 560px at 100% 100%, rgb(25 110 98 / 26%), transparent 70%),
    linear-gradient(165deg, rgb(9 29 34) 0%, rgb(27 57 66) 40%, rgb(239 243 235) 100%);
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
