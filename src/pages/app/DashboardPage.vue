<template>
  <v-row class="mb-4">
    <v-col cols="12" md="6" xl="3">
      <v-card class="h-100" rounded="xl">
        <v-card-item subtitle="Dados vindos de login/auth me" title="Usuário autenticado" />
        <v-card-text>
          <div class="text-h6 font-weight-bold">{{ session.state.session?.user.name || '-' }}</div>
          <div class="text-body-2 text-medium-emphasis">{{ session.state.session?.user.email || '-' }}</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6" xl="3">
      <v-card class="h-100" rounded="xl">
        <v-card-item subtitle="Contexto multi-tenant" title="Tenant" />
        <v-card-text>
          <div class="text-h6 font-weight-bold">{{ session.state.tenant?.name || 'N/D' }}</div>
          <div class="text-body-2 text-medium-emphasis">slug: {{ session.state.tenant?.slug || '-' }}</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6" xl="3">
      <v-card class="h-100" rounded="xl">
        <v-card-item subtitle="RBAC para menus e ações" title="Permissões" />
        <v-card-text>
          <div class="text-h4 font-weight-bold">{{ session.state.session?.user.permissions.length || 0 }}</div>
          <div class="text-body-2 text-medium-emphasis">permissões no token</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6" xl="3">
      <v-card class="h-100" rounded="xl">
        <v-card-item subtitle="Guardados por plano" title="Módulos SaaS" />
        <v-card-text>
          <div class="text-h4 font-weight-bold">{{ session.state.enabledModules.length }}</div>
          <div class="text-body-2 text-medium-emphasis">módulos habilitados</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-card class="mb-6" rounded="xl">
    <v-card-item subtitle="Fonte: GET /saas/tenant-modules/enabled" title="Módulos habilitados para este tenant" />
    <v-card-text>
      <div class="d-flex flex-wrap ga-2 mb-4">
        <v-chip
          v-for="moduleCode in session.state.enabledModules"
          :key="moduleCode"
          color="primary"
          variant="tonal"
        >
          {{ MODULE_LABELS[moduleCode] }}
        </v-chip>

        <v-chip v-if="session.state.enabledModules.length === 0" color="warning" variant="outlined">
          Nenhum módulo ativo
        </v-chip>
      </div>

      <v-alert v-if="lockedModules.length > 0" class="mb-3" type="warning" variant="tonal">
        O plano atual não libera: <strong>{{ lockedModules.join(', ') }}</strong>.
      </v-alert>

      <v-alert type="info" variant="tonal">
        Base de integração ativa: <strong>{{ apiBase }}</strong>
      </v-alert>
    </v-card-text>
  </v-card>

  <v-card rounded="xl">
    <v-card-item subtitle="Sequência para evolução do front" title="Ordem prática recomendada" />
    <v-card-text>
      <v-timeline align="start" density="compact" side="end">
        <v-timeline-item v-for="item in roadmap" :key="item.title" :dot-color="item.color" size="small">
          <div class="text-subtitle-1 font-weight-bold">{{ item.title }}</div>
          <p class="text-body-2 text-medium-emphasis">{{ item.description }}</p>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { ModuleCode } from '@/types/auth'
  import { computed } from 'vue'
  import { MODULE_LABELS } from '@/config/navigation'
  import { useSessionStore } from '@/stores/session'

  const session = useSessionStore()
  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '/api/v1'

  const allModules: ModuleCode[] = ['logistics', 'fleet', 'financial']

  const lockedModules = computed(() => {
    return allModules
      .filter(moduleCode => !session.state.enabledModules.includes(moduleCode))
      .map(moduleCode => MODULE_LABELS[moduleCode])
  })

  const roadmap = [
    {
      title: 'Prioridade 1: shell e sessão',
      description: 'Login, registro inicial, recuperação de sessão e menus dinâmicos por permissão/módulo.',
      color: 'primary',
    },
    {
      title: 'Prioridade 2: backoffice administrativo',
      description: 'Empresas, usuários, roles, permissões, vínculos, tenant/settings e auditoria.',
      color: 'secondary',
    },
    {
      title: 'Prioridade 3: operação logística',
      description: 'Motoristas, veículos, manutenção, pedidos, rotas/paradas, frete, shipments e fiscal.',
      color: 'teal',
    },
    {
      title: 'Prioridade 4: financeiro',
      description: 'Cadastros mestres, AP/AR, bancos, reconciliação, fluxo de caixa e relatórios.',
      color: 'amber',
    },
    {
      title: 'Prioridade 5: billing SaaS',
      description: 'Planos, assinatura atual, checkout, pagamentos e métricas de uso por tenant.',
      color: 'deep-orange',
    },
  ]
</script>
