<template>
  <PageHeader
    eyebrow="Gestao"
    subtitle="Organize equipe, perfis de acesso e acompanhe eventos importantes da empresa."
    title="Usuarios e Acessos"
  >
    <template #actions>
      <v-btn
        color="primary"
        :loading="loading"
        prepend-icon="mdi-refresh"
        variant="flat"
        @click="loadUsers"
        >Atualizar lista</v-btn
      >
      <v-btn prepend-icon="mdi-shield-account-outline" variant="outlined">Gerenciar perfis</v-btn>
    </template>
  </PageHeader>

  <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
    {{ errorMessage }}
  </v-alert>

  <v-row class="mb-2">
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Equipe com acesso ativo"
        icon="mdi-account-group-outline"
        label="Usuarios ativos"
        :value="String(activeUsersCount)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Usuarios sem acesso ativo"
        icon="mdi-account-off-outline"
        icon-color="warning"
        label="Usuarios inativos"
        :value="String(inactiveUsersCount)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Perfis atribuidos na empresa"
        icon="mdi-shield-key-outline"
        icon-color="secondary"
        label="Perfis de acesso"
        :value="String(profileDistribution.length)"
      />
    </v-col>
    <v-col cols="12" lg="3" sm="6">
      <MetricCard
        description="Registros carregados nesta visualizacao"
        icon="mdi-history"
        icon-color="info"
        label="Usuarios listados"
        :value="String(users.length)"
      />
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" xl="8">
      <v-card class="surface-card mb-4" variant="flat">
        <v-card-item subtitle="Dados reais do tenant atual" title="Equipe" />

        <v-table class="table-wrapper" density="comfortable">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfis</th>
              <th>Criado em</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Carregando usuarios...
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">
                Nenhum usuario encontrado para esta empresa.
              </td>
            </tr>
            <tr v-for="user in users" v-else :key="user.id">
              <td class="font-weight-medium">{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ formatRoleList(user) }}</td>
              <td>{{ formatDateTime(user.createdAt) }}</td>
              <td>
                <StatusChip :status="user.isActive ? 'active' : 'blocked'" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Ultimos registros da base" title="Atividade recente" />

        <v-list class="bg-transparent" density="comfortable" lines="two">
          <v-list-item
            v-for="item in recentActivity"
            :key="item.id"
            :subtitle="item.subtitle"
            :title="item.title"
          >
            <template #prepend>
              <v-avatar color="surface-variant" rounded="lg" size="30" variant="flat">
                <v-icon icon="mdi-account-clock-outline" size="18" />
              </v-avatar>
            </template>

            <template #append>
              <div class="text-caption text-medium-emphasis">{{ item.when }}</div>
            </template>
          </v-list-item>

          <v-list-item
            v-if="!loading && recentActivity.length === 0"
            title="Sem registros recentes para exibir"
          />
        </v-list>
      </v-card>
    </v-col>

    <v-col cols="12" xl="4">
      <v-card class="surface-card mb-4" variant="flat">
        <v-card-item subtitle="Distribuicao por perfil" title="Perfis de acesso" />

        <v-list class="bg-transparent" density="comfortable">
          <v-list-item v-for="profile in profileDistribution" :key="profile.name">
            <v-list-item-title class="font-weight-medium">{{ profile.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ profile.description }}</v-list-item-subtitle>

            <template #append>
              <v-chip color="primary" size="small" variant="tonal"
                >{{ profile.users }} usuarios</v-chip
              >
            </template>
          </v-list-item>

          <v-list-item
            v-if="!loading && profileDistribution.length === 0"
            title="Sem perfis atribuidos"
          />
        </v-list>
      </v-card>

      <v-card class="surface-card" variant="flat">
        <v-card-item subtitle="Padroes para administracao" title="Boas praticas" />
        <v-card-text>
          <v-list class="bg-transparent" density="compact">
            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Revise perfis de acesso mensalmente"
            />
            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Desative usuarios sem atividade"
            />
            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Registre mudancas de permissao"
            />
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { TenantUser } from '@/types/users'
import { computed, onMounted, ref } from 'vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusChip from '@/components/ui/StatusChip.vue'
import { usersApi } from '@/services/api'
import { ApiError } from '@/services/http'

const users = ref<TenantUser[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const activeUsersCount = computed(() => users.value.filter((user) => user.isActive).length)
const inactiveUsersCount = computed(() => users.value.filter((user) => !user.isActive).length)

const profileDistribution = computed(() => {
  const profileCounter = new Map<string, number>()

  for (const user of users.value) {
    const profiles = (user.userRoles ?? [])
      .map((assignment) => assignment.role?.name)
      .filter(Boolean) as string[]
    const normalizedProfiles = profiles.length > 0 ? profiles : ['Sem perfil']

    for (const profile of normalizedProfiles) {
      profileCounter.set(profile, (profileCounter.get(profile) ?? 0) + 1)
    }
  }

  const profiles = [...profileCounter.entries()].map(([name, count]) => ({
    name,
    users: count,
    description: profileDescription(name),
  }))

  profiles.sort((left: { users: number }, right: { users: number }) => right.users - left.users)
  return profiles
})

const recentActivity = computed(() => {
  const sortedUsers = [...users.value]

  sortedUsers.sort((left: TenantUser, right: TenantUser) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  })
  return sortedUsers.slice(0, 6).map((user: TenantUser) => ({
    id: user.id,
    title: `${user.name} (${formatRoleList(user)})`,
    subtitle: user.isActive ? 'Usuario ativo no sistema' : 'Usuario inativo',
    when: formatDateTime(user.updatedAt),
  }))
})

async function loadUsers() {
  loading.value = true
  errorMessage.value = null

  try {
    users.value = await usersApi.list({ page: 1, limit: 100 })
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : 'Nao foi possivel carregar os usuarios da empresa.'
  } finally {
    loading.value = false
  }
}

function formatRoleList(user: TenantUser): string {
  const roleNames = user.userRoles?.map((assignment) => assignment.role?.name).filter(Boolean) ?? []

  if (roleNames.length === 0) {
    return 'Sem perfil'
  }

  return roleNames.join(', ')
}

function profileDescription(profileName: string): string {
  if (profileName.toLowerCase() === 'owner') {
    return 'Perfil administrativo com acesso amplo.'
  }

  if (profileName === 'Sem perfil') {
    return 'Usuarios sem atribuicao de perfil no momento.'
  }

  return 'Perfil configurado para operacao da empresa.'
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  void loadUsers()
})
</script>
