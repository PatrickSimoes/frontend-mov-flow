<template>
  <v-card class="mb-6" rounded="xl">
    <v-card-item subtitle="Gestão de tenant, acesso e governança" title="Backoffice Administrativo" />
    <v-card-text>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Este bloco cobre os recursos de administração do tenant. A navegação e as ações são liberadas por
        permissões RBAC.
      </p>

      <v-alert type="info" variant="tonal">
        Observação: <strong>Units</strong> atualmente expõe apenas <code>POST /units</code> no backend.
      </v-alert>
    </v-card-text>
  </v-card>

  <CapabilityGrid :items="adminCapabilities" />
</template>

<script setup lang="ts">
  import type { CapabilityItem } from '@/types/capability'
  import CapabilityGrid from '@/components/app/CapabilityGrid.vue'

  const adminCapabilities: CapabilityItem[] = [
    {
      title: 'Meu Tenant',
      description: 'Contexto da empresa atual autenticada.',
      endpoints: ['GET /tenants/me'],
      permissionsAll: ['tenants.read'],
    },
    {
      title: 'Empresas',
      description: 'CRUD de empresas vinculadas ao tenant.',
      endpoints: ['POST /companies', 'GET /companies', 'GET /companies/:id', 'PATCH /companies/:id', 'DELETE /companies/:id'],
      permissionsAny: ['companies.read', 'companies.create', 'companies.update', 'companies.delete'],
    },
    {
      title: 'Usuários',
      description: 'Gestão de usuários e ciclo de vida de acesso.',
      endpoints: ['POST /users', 'GET /users', 'GET /users/:id', 'PATCH /users/:id', 'DELETE /users/:id'],
      permissionsAny: ['users.read', 'users.create', 'users.update', 'users.delete'],
    },
    {
      title: 'Roles e Permissões',
      description: 'Modelagem de RBAC e regras de autorização.',
      endpoints: [
        'POST /roles',
        'GET /roles',
        'PATCH /roles/:id',
        'POST /permissions',
        'GET /permissions',
        'PATCH /permissions/:id',
      ],
      permissionsAny: ['roles.read', 'roles.manage', 'permissions.read', 'permissions.manage'],
    },
    {
      title: 'Vínculo Usuário ↔ Role',
      description: 'Associação de papéis para usuários.',
      endpoints: ['POST /user-roles', 'GET /user-roles', 'DELETE /user-roles/:id'],
      permissionsAny: ['roles.read', 'roles.manage'],
    },
    {
      title: 'Auditoria',
      description: 'Trilha de atividades administrativas.',
      endpoints: ['GET /audit/logs'],
      permissionsAll: ['audit.logs.read'],
    },
    {
      title: 'Configurações do Tenant',
      description: 'Parâmetros financeiros e operacionais globais.',
      endpoints: ['GET /settings', 'PATCH /settings', 'GET /settings/audit'],
      permissionsAny: ['settings.read', 'settings.update', 'settings.audit.read'],
    },
    {
      title: 'Unidades Operacionais',
      description: 'Criação inicial de unidade operacional (sem CRUD completo ainda).',
      endpoints: ['POST /units'],
      permissionsAll: ['units.create'],
    },
  ]
</script>
