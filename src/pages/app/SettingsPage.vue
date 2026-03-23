<template>
  <v-row>
    <v-col cols="12" lg="8">
      <v-card class="mb-6" rounded="xl">
        <v-card-item
          subtitle="GET/PATCH /settings"
          title="Configurações do Tenant"
        />

        <v-card-text>
          <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
            {{ errorMessage }}
          </v-alert>

          <v-form @submit.prevent="saveSettings">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.trim="form.currency"
                  :disabled="loading"
                  label="Moeda (ISO 4217)"
                  maxlength="3"
                  placeholder="BRL"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-text-field
                  v-model.trim="form.timezone"
                  :disabled="loading"
                  label="Timezone"
                  placeholder="America/Sao_Paulo"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultInterestRate"
                  :disabled="loading"
                  label="Juros padrão (%)"
                  max="999.9999"
                  min="0"
                  required
                  step="0.0001"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultFineRate"
                  :disabled="loading"
                  label="Multa padrão (%)"
                  max="999.9999"
                  min="0"
                  required
                  step="0.0001"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultPaymentTermDays"
                  :disabled="loading"
                  label="Prazo padrão (dias)"
                  max="365"
                  min="0"
                  required
                  step="1"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="form.autoGenerateReceivableOnDelivery"
                  color="primary"
                  :disabled="loading"
                  inset
                  label="Auto-gerar recebível na entrega"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="form.allowNegativeCashFlow"
                  color="primary"
                  :disabled="loading"
                  inset
                  label="Permitir fluxo de caixa negativo"
                />
              </v-col>
            </v-row>

            <div class="d-flex ga-3 mt-2">
              <v-btn color="primary" :loading="saving" prepend-icon="mdi-content-save-outline" type="submit">
                Salvar configurações
              </v-btn>
              <v-btn :disabled="loading" prepend-icon="mdi-refresh" variant="outlined" @click="loadSettings">
                Recarregar
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card rounded="xl">
        <v-card-item subtitle="GET /settings/audit" title="Auditoria de Configurações" />
        <v-card-text>
          <v-alert
            v-if="!canReadAudit"
            class="mb-4"
            type="info"
            variant="tonal"
          >
            Sem permissão <code>settings.audit.read</code> para consultar histórico.
          </v-alert>

          <v-list v-else class="pa-0 bg-transparent" density="compact" lines="two">
            <v-list-item v-for="entry in auditEntries.slice(0, 8)" :key="entry.id" prepend-icon="mdi-history">
              <v-list-item-title>{{ formatDateTime(entry.createdAt) }}</v-list-item-title>
              <v-list-item-subtitle>
                changedBy: {{ entry.changedBy || 'sistema' }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-alert v-if="canReadAudit && auditEntries.length === 0" type="info" variant="tonal">
            Nenhuma alteração auditada encontrada.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import type { TenantSettings, TenantSettingsAuditEntry, TenantSettingsUpdatePayload } from '@/types/settings'
  import { computed, reactive, ref } from 'vue'
  import { settingsApi } from '@/services/api'
  import { ApiError } from '@/services/http'
  import { useSessionStore } from '@/stores/session'

  const session = useSessionStore()

  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref<string | null>(null)

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

  async function loadSettings () {
    loading.value = true
    errorMessage.value = null

    try {
      const settings = await settingsApi.getSettings()
      applySettings(settings)

      if (canReadAudit.value) {
        auditEntries.value = await settingsApi.listAudit()
      }
    } catch (error) {
      errorMessage.value
        = error instanceof ApiError ? error.message : 'Falha ao carregar configurações do tenant.'
    } finally {
      loading.value = false
    }
  }

  async function saveSettings () {
    saving.value = true
    errorMessage.value = null

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
    } catch (error) {
      errorMessage.value
        = error instanceof ApiError ? error.message : 'Falha ao salvar configurações.'
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
