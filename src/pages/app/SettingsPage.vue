<template>
  <AppPageHeader
    subtitle="Configurações globais financeiras e operacionais do tenant"
    title="Configurações"
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
  </AppPageHeader>

  <v-row>
    <v-col cols="12" lg="8">
      <v-card rounded="xl" variant="flat">
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
                  label="Moeda"
                  maxlength="3"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-text-field
                  v-model.trim="form.timezone"
                  :disabled="loading"
                  label="Timezone"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultInterestRate"
                  :disabled="loading"
                  label="Juros padrão (%)"
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

            <div class="d-flex justify-end ga-2 mt-2">
              <v-btn
                color="primary"
                :loading="saving"
                prepend-icon="mdi-content-save-outline"
                type="submit"
              >
                Salvar
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card rounded="xl" variant="flat">
        <v-card-item subtitle="GET /settings/audit" title="Auditoria" />
        <v-card-text>
          <v-alert v-if="!canReadAudit" type="info" variant="tonal">
            Sem permissão <code>settings.audit.read</code>.
          </v-alert>

          <v-list v-else-if="auditEntries.length > 0" density="compact">
            <v-list-item
              v-for="entry in auditEntries.slice(0, 10)"
              :key="entry.id"
              prepend-icon="mdi-history"
            >
              <v-list-item-title>{{ formatDateTime(entry.createdAt) }}</v-list-item-title>
              <v-list-item-subtitle
                >changedBy: {{ entry.changedBy || 'sistema' }}</v-list-item-subtitle
              >
            </v-list-item>
          </v-list>

          <v-alert v-else-if="canReadAudit" type="info" variant="tonal">
            Nenhum histórico disponível.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { apiClient } from '@/core/http/client'
import { formatDateTime } from '@/core/utils/formatters'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'
import { useAppShellStore } from '@/stores/app-shell'
import { useAuthStore } from '@/stores/auth'

interface TenantSettings {
  id: string
  tenantId: string
  currency: string
  timezone: string
  defaultInterestRate: number
  defaultFineRate: number
  defaultPaymentTermDays: number
  autoGenerateReceivableOnDelivery: boolean
  allowNegativeCashFlow: boolean
  createdAt: string
  updatedAt: string
  version: number
}

interface TenantSettingsAuditEntry {
  id: string
  changedBy?: string
  createdAt: string
}

const auth = useAuthStore()
const appShell = useAppShellStore()

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref<string | null>(null)
const auditEntries = ref<TenantSettingsAuditEntry[]>([])

const form = reactive({
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  defaultInterestRate: 0,
  defaultFineRate: 0,
  defaultPaymentTermDays: 0,
  autoGenerateReceivableOnDelivery: true,
  allowNegativeCashFlow: false,
})

const canReadAudit = computed(() => auth.hasPermission('settings.audit.read'))

function applySettings(settings: TenantSettings) {
  form.currency = settings.currency
  form.timezone = settings.timezone
  form.defaultInterestRate = Number(settings.defaultInterestRate)
  form.defaultFineRate = Number(settings.defaultFineRate)
  form.defaultPaymentTermDays = Number(settings.defaultPaymentTermDays)
  form.autoGenerateReceivableOnDelivery = settings.autoGenerateReceivableOnDelivery
  form.allowNegativeCashFlow = settings.allowNegativeCashFlow
}

async function loadSettings() {
  loading.value = true
  errorMessage.value = null

  try {
    const settings = await apiClient.get<TenantSettings>('/settings')
    applySettings(settings)

    if (canReadAudit.value) {
      auditEntries.value = await apiClient.get<TenantSettingsAuditEntry[]>('/settings/audit')
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao carregar configurações.'
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  errorMessage.value = null

  try {
    const payload = {
      currency: form.currency.toUpperCase(),
      timezone: form.timezone,
      defaultInterestRate: Number(form.defaultInterestRate),
      defaultFineRate: Number(form.defaultFineRate),
      defaultPaymentTermDays: Number(form.defaultPaymentTermDays),
      autoGenerateReceivableOnDelivery: Boolean(form.autoGenerateReceivableOnDelivery),
      allowNegativeCashFlow: Boolean(form.allowNegativeCashFlow),
    }

    const saved = await apiClient.patch<TenantSettings>('/settings', payload)
    applySettings(saved)
    appShell.notify('Configurações salvas com sucesso.', 'success')

    if (canReadAudit.value) {
      auditEntries.value = await apiClient.get<TenantSettingsAuditEntry[]>('/settings/audit')
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao salvar configurações.'
    appShell.notify(errorMessage.value, 'error')
  } finally {
    saving.value = false
  }
}

void loadSettings()
</script>
