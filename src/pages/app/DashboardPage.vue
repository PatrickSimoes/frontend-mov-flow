<template>
  <AppPageHeader
    subtitle="Visão consolidada de autenticação, tenant e módulos habilitados"
    title="Dashboard"
  />

  <v-row class="mb-5">
    <v-col cols="12" md="6" xl="3">
      <v-card class="h-100" rounded="xl" variant="flat">
        <v-card-item subtitle="Usuário autenticado" title="Sessão" />
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">{{ auth.session?.user.name || '-' }}</div>
          <div class="text-body-2 text-medium-emphasis">{{ auth.session?.user.email || '-' }}</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6" xl="3">
      <v-card class="h-100" rounded="xl" variant="flat">
        <v-card-item subtitle="Tenant ativo" title="Contexto" />
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">{{ auth.tenant?.name || '-' }}</div>
          <div class="text-body-2 text-medium-emphasis">slug: {{ auth.tenant?.slug || '-' }}</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6" xl="3">
      <v-card class="h-100" rounded="xl" variant="flat">
        <v-card-item subtitle="RBAC efetivo" title="Permissões" />
        <v-card-text>
          <div class="text-h4 font-weight-bold">{{ auth.permissions.length }}</div>
          <div class="text-body-2 text-medium-emphasis">permissões carregadas</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6" xl="3">
      <v-card class="h-100" rounded="xl" variant="flat">
        <v-card-item subtitle="Plano atual" title="Módulos" />
        <v-card-text>
          <div class="text-h4 font-weight-bold">{{ auth.enabledModules.length }}</div>
          <div class="text-body-2 text-medium-emphasis">módulos liberados</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-card class="mb-5" rounded="xl" variant="flat">
    <v-card-item subtitle="Módulos habilitados" title="Acesso por assinatura" />
    <v-card-text>
      <div class="d-flex flex-wrap ga-2">
        <v-chip
          v-for="moduleCode in auth.enabledModules"
          :key="moduleCode"
          color="primary"
          size="small"
          variant="tonal"
        >
          {{ moduleLabel(moduleCode) }}
        </v-chip>

        <v-chip v-if="auth.enabledModules.length === 0" color="warning" variant="outlined">
          Módulos não carregados para este perfil
        </v-chip>
      </div>
    </v-card-text>
  </v-card>

  <v-row>
    <v-col cols="12" lg="4">
      <v-card rounded="xl" variant="flat">
        <v-card-item subtitle="Administração" title="Acesso rápido" />
        <v-list>
          <v-list-item prepend-icon="mdi-domain" title="Meu tenant" to="/app/admin/tenant" />
          <v-list-item
            prepend-icon="mdi-office-building-outline"
            title="Empresas"
            to="/app/admin/companies"
          />
          <v-list-item
            prepend-icon="mdi-account-group-outline"
            title="Usuários"
            to="/app/admin/users"
          />
        </v-list>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card rounded="xl" variant="flat">
        <v-card-item subtitle="Operações" title="Acesso rápido" />
        <v-list>
          <v-list-item
            prepend-icon="mdi-truck-outline"
            title="Motoristas"
            to="/app/operations/drivers"
          />
          <v-list-item
            prepend-icon="mdi-truck-fast-outline"
            title="Shipments"
            to="/app/operations/shipments"
          />
          <v-list-item
            prepend-icon="mdi-cash-minus"
            title="Driver payments"
            to="/app/operations/driver-payments"
          />
        </v-list>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card rounded="xl" variant="flat">
        <v-card-item subtitle="Financeiro e billing" title="Acesso rápido" />
        <v-list>
          <v-list-item
            prepend-icon="mdi-cash-minus"
            title="Contas a pagar"
            to="/app/financial/accounts-payable"
          />
          <v-list-item
            prepend-icon="mdi-chart-line"
            title="Relatórios"
            to="/app/financial/reports/dashboard"
          />
          <v-list-item
            prepend-icon="mdi-credit-card-outline"
            title="Planos e assinatura"
            to="/app/billing/plans"
          />
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { ModuleCode } from '@/core/types/auth'
import AppPageHeader from '@/shared/components/AppPageHeader.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

function moduleLabel(moduleCode: ModuleCode): string {
  if (moduleCode === 'fleet') return 'Frota'
  if (moduleCode === 'financial') return 'Financeiro'
  return 'Logística'
}
</script>
