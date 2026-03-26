<template>
  <PageHeader
    eyebrow="Gestao"
    subtitle="Organize equipe, perfis de acesso e acompanhe eventos importantes da empresa."
    title="Usuarios e Acessos"
  >
    <template #actions>
      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus-outline"
        variant="flat"
      >Novo usuario</v-btn>
      <v-btn prepend-icon="mdi-shield-account-outline" variant="outlined">Gerenciar perfis</v-btn>
    </template>
  </PageHeader>

  <v-row class="mb-2">
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Equipe com acesso ativo"
        icon="mdi-account-group-outline"
        label="Usuarios ativos"
        value="18"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Perfis personalizados e padrao"
        icon="mdi-shield-key-outline"
        icon-color="secondary"
        label="Perfis de acesso"
        value="6"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Pendentes de confirmacao"
        icon="mdi-account-clock-outline"
        icon-color="warning"
        label="Convites pendentes"
        value="3"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Ultimas 24 horas"
        icon="mdi-history"
        icon-color="info"
        label="Eventos registrados"
        value="42"
      />
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" xl="8">
      <v-card class="surface-card mb-4" variant="flat">
        <v-card-item subtitle="Perfis e status da equipe" title="Equipe" />

        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Perfil</th>
              <th>Area</th>
              <th>Ultimo acesso</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="font-weight-medium">{{ user.name }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.area }}</td>
              <td>{{ user.lastAccess }}</td>
              <td>
                <StatusChip :status="user.status" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Ultimos registros relevantes" title="Auditoria" />

        <v-list class="bg-transparent" density="comfortable" lines="two">
          <v-list-item
            v-for="event in auditEvents"
            :key="event.id"
            :subtitle="event.description"
            :title="event.title"
          >
            <template #prepend>
              <v-avatar color="surface-variant" rounded="lg" size="30" variant="flat">
                <v-icon :icon="event.icon" size="18" />
              </v-avatar>
            </template>

            <template #append>
              <div class="text-caption text-medium-emphasis">{{ event.when }}</div>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>

    <v-col cols="12" xl="4">
      <v-card class="surface-card mb-4" variant="flat">
        <v-card-item subtitle="Distribuicao por perfil" title="Perfis de acesso" />

        <v-list class="bg-transparent" density="comfortable">
          <v-list-item v-for="profile in profiles" :key="profile.name">
            <v-list-item-title class="font-weight-medium">{{ profile.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ profile.description }}</v-list-item-subtitle>

            <template #append>
              <v-chip
                color="primary"
                size="small"
                variant="tonal"
              >{{ profile.users }} usuarios</v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card>

      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Padroes para administracao" title="Boas praticas" />
        <v-card-text>
          <v-list class="bg-transparent" density="compact">
            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Revisar perfis de acesso mensalmente"
            />
            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Desativar usuarios sem atividade"
            />
            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Registrar mudancas de permissao"
            />
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import MetricCard from '@/components/ui/MetricCard.vue'
  import PageHeader from '@/components/ui/PageHeader.vue'
  import StatusChip from '@/components/ui/StatusChip.vue'

  const users = [
    {
      id: 'user-1',
      name: 'Ana Martins',
      role: 'Administradora',
      area: 'Financeiro',
      lastAccess: 'Hoje, 09:22',
      status: 'active',
    },
    {
      id: 'user-2',
      name: 'Carlos Ferreira',
      role: 'Supervisor Operacional',
      area: 'Operacao',
      lastAccess: 'Hoje, 08:47',
      status: 'active',
    },
    {
      id: 'user-3',
      name: 'Marina Souza',
      role: 'Analista de Frota',
      area: 'Frota',
      lastAccess: 'Ontem, 18:16',
      status: 'pending',
    },
    {
      id: 'user-4',
      name: 'Pedro Lima',
      role: 'Financeiro',
      area: 'Financeiro',
      lastAccess: 'Ontem, 16:01',
      status: 'blocked',
    },
  ]

  const profiles = [
    {
      name: 'Administradora',
      description: 'Acesso completo a operacao e configuracoes',
      users: 2,
    },
    {
      name: 'Supervisor Operacional',
      description: 'Gestao de pedidos, entregas e frota',
      users: 5,
    },
    {
      name: 'Financeiro',
      description: 'Controle de contas, conciliacao e relatorios',
      users: 4,
    },
  ]

  const auditEvents = [
    {
      id: 'audit-1',
      title: 'Perfil atualizado para Marina Souza',
      description: 'Permissoes de operacao e frota foram ajustadas.',
      when: 'Ha 1h',
      icon: 'mdi-shield-edit-outline',
    },
    {
      id: 'audit-2',
      title: 'Novo usuario convidado',
      description: 'Convite enviado para joao@empresa.com.',
      when: 'Ha 3h',
      icon: 'mdi-account-plus-outline',
    },
    {
      id: 'audit-3',
      title: 'Permissao removida de perfil temporario',
      description: 'Ajuste preventivo realizado pela administracao.',
      when: 'Ontem',
      icon: 'mdi-lock-outline',
    },
  ]
</script>
