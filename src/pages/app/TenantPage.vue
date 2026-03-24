<template>
  <AppPageHeader subtitle="Dados do tenant autenticado e contexto multi-tenant" title="Meu Tenant">
    <template #actions>
      <v-btn color="primary" prepend-icon="mdi-refresh" @click="loadTenant">Atualizar</v-btn>
    </template>
  </AppPageHeader>

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
    {{ errorMessage }}
  </v-alert>

  <v-card rounded="xl" variant="flat">
    <v-card-text>
      <v-skeleton-loader v-if="loading" type="article" />

      <div v-else>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">ID</div>
            <div class="text-body-1 mb-3 text-mono">{{ tenant?.id || '-' }}</div>

            <div class="text-caption text-medium-emphasis">Nome</div>
            <div class="text-body-1 mb-3">{{ tenant?.name || '-' }}</div>

            <div class="text-caption text-medium-emphasis">Slug</div>
            <div class="text-body-1 mb-3">{{ tenant?.slug || '-' }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Criado em</div>
            <div class="text-body-1 mb-3">{{ formatDateTime(tenant?.createdAt) }}</div>

            <div class="text-caption text-medium-emphasis">Atualizado em</div>
            <div class="text-body-1 mb-3">{{ formatDateTime(tenant?.updatedAt) }}</div>

            <div class="text-caption text-medium-emphasis">Módulos habilitados</div>
            <div class="d-flex flex-wrap ga-2 mt-2">
              <v-chip
                v-for="moduleCode in auth.enabledModules"
                :key="moduleCode"
                color="primary"
                size="small"
                variant="tonal"
              >
                {{ moduleCode }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { TenantProfile } from '@/core/types/auth'
import { ref } from 'vue'
import { apiClient } from '@/core/http/client'
import { formatDateTime } from '@/core/utils/formatters'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const tenant = ref<TenantProfile | null>(auth.tenant)

async function loadTenant() {
  loading.value = true
  errorMessage.value = null

  try {
    tenant.value = await apiClient.get<TenantProfile>('/tenants/me')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao carregar tenant.'
  } finally {
    loading.value = false
  }
}

void loadTenant()
</script>
