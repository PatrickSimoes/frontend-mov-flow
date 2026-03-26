<template>
  <AuthShell
    description="Acompanhe pedidos, entregas, financeiro e resultados em um painel unico."
    :highlights="highlights"
    title="Bem-vindo ao seu centro de operacoes"
  >
    <div class="mb-6">
      <div class="text-overline text-medium-emphasis">Acesso seguro</div>
      <h2 class="text-h5 font-weight-bold mb-2">Entrar na plataforma</h2>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Informe o codigo da empresa, seu e-mail e senha para continuar.
      </p>
    </div>

    <v-form @submit.prevent="handleSubmit">
      <v-text-field
        v-model.trim="form.tenantSlug"
        label="Codigo da empresa"
        placeholder="sua-empresa"
        prepend-inner-icon="mdi-domain"
        required
      />

      <v-text-field
        v-model.trim="form.email"
        label="E-mail"
        prepend-inner-icon="mdi-email-outline"
        required
        type="email"
      />

      <v-text-field
        v-model="form.password"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        label="Senha"
        prepend-inner-icon="mdi-lock-outline"
        required
        :type="showPassword ? 'text' : 'password'"
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
      Primeira vez por aqui?
      <RouterLink class="font-weight-bold" to="/register">Criar conta da empresa</RouterLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AuthShell from '@/components/public/AuthShell.vue'
  import { ApiError } from '@/services/http'
  import { useSessionStore } from '@/stores/session'

  const router = useRouter()
  const route = useRoute()
  const session = useSessionStore()

  const highlights = [
    'Visao consolidada de operacao e financeiro',
    'Acoes rapidas para tarefas do dia a dia',
    'Controle de acesso por perfil de usuario',
  ]

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
      errorMessage.value = 'Preencha codigo da empresa, e-mail e senha.'
      return
    }

    submitting.value = true
    errorMessage.value = null

    try {
      await session.login(form)
      const redirectTarget
        = typeof route.query.redirect === 'string' ? route.query.redirect : '/app/dashboard'
      await router.push(redirectTarget)
    } catch (error) {
      errorMessage.value
        = error instanceof ApiError ? error.message : 'Nao foi possivel entrar. Tente novamente.'
    } finally {
      submitting.value = false
    }
  }
</script>
