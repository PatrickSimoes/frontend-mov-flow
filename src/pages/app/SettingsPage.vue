<template>
  <PageHeader
    eyebrow="Configuracoes"
    subtitle="Defina parametros padrao para garantir consistencia financeira e operacional."
    title="Configuracoes da Empresa"
  >
    <template #actions>
      <v-btn
        :disabled="loading"
        prepend-icon="mdi-refresh"
        variant="outlined"
        @click="loadSettings"
      >
        Recarregar
      </v-btn>
    </template>
  </PageHeader>

  <v-row>
    <v-col cols="12" lg="8">
      <v-card class="surface-card" variant="flat">
        <v-card-item
          subtitle="Parametros aplicados em novos lancamentos"
          title="Preferencias gerais"
        />

        <v-card-text>
          <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
            {{ errorMessage }}
          </v-alert>

          <v-alert v-if="successMessage" class="mb-4" type="success" variant="tonal">
            {{ successMessage }}
          </v-alert>

          <v-form @submit.prevent="saveSettings">
            <div class="text-subtitle-1 font-weight-bold mb-3">Dados de operacao</div>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.trim="form.currency"
                  :disabled="loading"
                  label="Moeda padrao (ISO)"
                  maxlength="3"
                  placeholder="BRL"
                  required
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-text-field
                  v-model.trim="form.timezone"
                  :disabled="loading"
                  label="Fuso horario"
                  placeholder="America/Sao_Paulo"
                  required
                />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div class="text-subtitle-1 font-weight-bold mb-3">Regras financeiras</div>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultInterestRate"
                  :disabled="loading"
                  label="Juros padrao (%)"
                  max="999.9999"
                  min="0"
                  required
                  step="0.0001"
                  type="number"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultFineRate"
                  :disabled="loading"
                  label="Multa padrao (%)"
                  max="999.9999"
                  min="0"
                  required
                  step="0.0001"
                  type="number"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultPaymentTermDays"
                  :disabled="loading"
                  label="Prazo padrao (dias)"
                  max="365"
                  min="0"
                  required
                  step="1"
                  type="number"
                />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div class="text-subtitle-1 font-weight-bold mb-3">Automacoes</div>

            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="form.autoGenerateReceivableOnDelivery"
                  color="primary"
                  :disabled="loading"
                  inset
                  label="Gerar conta a receber automaticamente na entrega"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="form.allowNegativeCashFlow"
                  color="primary"
                  :disabled="loading"
                  inset
                  label="Permitir saldo negativo no fluxo de caixa"
                />
              </v-col>
            </v-row>

            <div class="d-flex ga-3 mt-2 flex-wrap">
              <v-btn
                color="primary"
                :loading="saving"
                prepend-icon="mdi-content-save-outline"
                type="submit"
              >
                Salvar configuracoes
              </v-btn>
              <v-btn
                :disabled="loading"
                prepend-icon="mdi-restore"
                variant="text"
                @click="restoreFromCurrent"
              >
                Restaurar valores atuais
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card class="surface-card mb-4" variant="flat">
        <v-card-item subtitle="Ultimas alteracoes registradas" title="Historico" />
        <v-card-text>
          <v-alert v-if="!canReadAudit" class="mb-4" type="info" variant="tonal">
            Seu perfil nao possui acesso ao historico de alteracoes.
          </v-alert>

          <v-list v-else class="pa-0 bg-transparent" density="compact" lines="two">
            <v-list-item
              v-for="entry in auditEntries.slice(0, 8)"
              :key="entry.id"
              prepend-icon="mdi-history"
            >
              <v-list-item-title>{{ formatDateTime(entry.createdAt) }}</v-list-item-title>
              <v-list-item-subtitle>
                Alterado por: {{ entry.changedBy || 'sistema' }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-alert v-if="canReadAudit && auditEntries.length === 0" type="info" variant="tonal">
            Nenhuma alteracao registrada ate o momento.
          </v-alert>
        </v-card-text>
      </v-card>

      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Recomendacoes" title="Boas praticas" />
        <v-card-text>
          <v-list class="bg-transparent" density="compact">
            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Revise juros e multa periodicamente"
            />
            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Mantenha o fuso horario da operacao"
            />
            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Valide as automacoes antes de ativar"
            />
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import type {
    TenantSettings,
    TenantSettingsAuditEntry,
    TenantSettingsUpdatePayload,
  } from '@/types/settings'
  import { computed, reactive, ref } from 'vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import { settingsApi } from '@/services/api'
  import { ApiError } from '@/services/http'
  import { useSessionStore } from '@/stores/session'

  const session = useSessionStore()

  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const currentSettings = ref<TenantSettings | null>(null)
  const auditEntries = ref<TenantSettingsAuditEntry[]>([])

  const form = reactive<TenantSettingsUpdatePayload>({
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    defaultInterestRate: 0,
    defaultFineRate: 0,
    defaultPaymentTermDays: 0,
    autoGenerateReceivableOnDelivery: true,
    allowNegativeCashFlow: false,
  })

  const canReadAudit = computed(() => session.hasPermission('settings.audit.read'))

  function applySettings (settings: TenantSettings) {
    currentSettings.value = settings
    form.currency = settings.currency
    form.timezone = settings.timezone
    form.defaultInterestRate = Number(settings.defaultInterestRate)
    form.defaultFineRate = Number(settings.defaultFineRate)
    form.defaultPaymentTermDays = Number(settings.defaultPaymentTermDays)
    form.autoGenerateReceivableOnDelivery = settings.autoGenerateReceivableOnDelivery
    form.allowNegativeCashFlow = settings.allowNegativeCashFlow
  }

  function restoreFromCurrent () {
    if (!currentSettings.value) return
    applySettings(currentSettings.value)
    successMessage.value = 'Valores atuais restaurados no formulario.'
  }

  async function loadSettings () {
    loading.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      const settings = await settingsApi.getSettings()
      applySettings(settings)

      if (canReadAudit.value) {
        auditEntries.value = await settingsApi.listAudit()
      }
    } catch (error) {
      errorMessage.value
        = error instanceof ApiError ? error.message : 'Falha ao carregar configuracoes da empresa.'
    } finally {
      loading.value = false
    }
  }

  async function saveSettings () {
    saving.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      const payload: TenantSettingsUpdatePayload = {
        currency: form.currency?.toUpperCase(),
        timezone: form.timezone,
        defaultInterestRate: Number(form.defaultInterestRate),
        defaultFineRate: Number(form.defaultFineRate),
        defaultPaymentTermDays: Number(form.defaultPaymentTermDays),
        autoGenerateReceivableOnDelivery: Boolean(form.autoGenerateReceivableOnDelivery),
        allowNegativeCashFlow: Boolean(form.allowNegativeCashFlow),
      }

      const saved = await settingsApi.updateSettings(payload)
      applySettings(saved)

      if (canReadAudit.value) {
        auditEntries.value = await settingsApi.listAudit()
      }

      successMessage.value = 'Configuracoes salvas com sucesso.'
    } catch (error) {
      errorMessage.value
        = error instanceof ApiError ? error.message : 'Falha ao salvar configuracoes.'
    } finally {
      saving.value = false
    }
  }

  function formatDateTime (value: string): string {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`
  }

  void loadSettings()
</script>
