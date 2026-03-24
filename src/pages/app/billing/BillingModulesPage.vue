<template>
  <AppPageHeader subtitle="Módulos liberados pelo plano atual" title="Módulos Habilitados" />

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">{{
    errorMessage
  }}</v-alert>

  <v-row>
    <v-col cols="12" lg="8">
      <v-card rounded="xl" variant="flat">
        <v-card-item subtitle="GET /saas/tenant-modules/enabled" title="Disponibilidade atual" />
        <v-card-text>
          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip
              v-for="moduleCode in enabledModules"
              :key="moduleCode"
              color="success"
              variant="tonal"
            >
              {{ moduleCode }}
            </v-chip>
          </div>

          <AppEmptyState
            v-if="enabledModules.length === 0"
            description="Nenhum módulo habilitado foi retornado para este perfil."
            title="Sem módulos"
          />

          <div class="d-flex justify-end mt-4">
            <v-btn color="primary" prepend-icon="mdi-refresh" @click="loadEnabledModules"
              >Atualizar</v-btn
            >
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card rounded="xl" variant="flat">
        <v-card-item subtitle="Upgrade" title="Desbloquear módulos" />
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Se um módulo necessário estiver bloqueado, selecione um plano com cobertura completa.
          </p>

          <v-btn
            block
            color="secondary"
            prepend-icon="mdi-arrow-up-bold-box-outline"
            to="/app/billing/plans"
          >
            Ver planos
          </v-btn>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiClient } from '@/core/http/client'
import AppEmptyState from '@/shared/components/AppEmptyState.vue'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'

const enabledModules = ref<string[]>([])
const errorMessage = ref<string | null>(null)

async function loadEnabledModules() {
  errorMessage.value = null

  try {
    enabledModules.value = await apiClient.get<string[]>('/saas/tenant-modules/enabled')
  } catch (error) {
    enabledModules.value = []
    errorMessage.value =
      error instanceof Error ? error.message : 'Falha ao carregar módulos habilitados.'
  }
}

void loadEnabledModules()
</script>
