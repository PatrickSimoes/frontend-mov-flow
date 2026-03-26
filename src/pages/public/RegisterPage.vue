<template>
  <AuthShell
    description="Configure sua empresa em poucos minutos e comece a operar com mais previsibilidade."
    :highlights="highlights"
    title="Comece com uma base pronta"
  >
    <div class="mb-6">
      <div class="text-overline text-medium-emphasis">Criacao da conta</div>
      <h2 class="text-h5 font-weight-bold mb-2">Cadastrar empresa</h2>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Esse cadastro cria a empresa e um usuario administrador inicial.
      </p>
    </div>

    <v-form @submit.prevent="handleSubmit">
      <v-text-field
        v-model.trim="form.tenantName"
        label="Nome da empresa"
        prepend-inner-icon="mdi-office-building-outline"
        required
      />

      <v-text-field
        v-model.trim="form.name"
        label="Nome do responsavel"
        prepend-inner-icon="mdi-account-outline"
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
        hint="Use no minimo 8 caracteres."
        label="Senha"
        persistent-hint
        prepend-inner-icon="mdi-lock-outline"
        required
        :type="showPassword ? 'text' : 'password'"
        @click:append-inner="showPassword = !showPassword"
      />

      <v-text-field
        v-model="confirmPassword"
        label="Confirmar senha"
        prepend-inner-icon="mdi-lock-check-outline"
        required
        :type="showPassword ? 'text' : 'password'"
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
        Criar empresa e continuar
      </v-btn>
    </v-form>

    <div class="text-body-2 text-medium-emphasis mt-4">
      Ja possui acesso?
      <RouterLink class="font-weight-bold" to="/login">Entrar</RouterLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import AuthShell from '@/components/public/AuthShell.vue'
  import { ApiError } from '@/services/http'
  import { useSessionStore } from '@/stores/session'

  const router = useRouter()
  const session = useSessionStore()

  const highlights = [
    'Configurar usuarios e perfis com facilidade',
    'Acompanhar pedidos, entregas e custos em um so lugar',
    'Evoluir sem perder controle operacional',
  ]

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
      errorMessage.value = 'Preencha todos os campos obrigatorios.'
      return
    }

    if (form.password.length < 8) {
      errorMessage.value = 'A senha precisa ter no minimo 8 caracteres.'
      return
    }

    if (form.password !== confirmPassword.value) {
      errorMessage.value = 'As senhas nao conferem.'
      return
    }

    submitting.value = true
    errorMessage.value = null

    try {
      await session.register(form)
      await router.push('/app/dashboard')
    } catch (error) {
      errorMessage.value
        = error instanceof ApiError ? error.message : 'Nao foi possivel concluir o cadastro.'
    } finally {
      submitting.value = false
    }
  }
</script>
