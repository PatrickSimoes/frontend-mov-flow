<template>
  <v-row>
    <v-col
      v-for="item in items"
      :key="item.title"
      cols="12"
      md="6"
      xl="4"
    >
      <v-card class="h-100" :color="statusColor(item)" rounded="xl" :variant="statusVariant(item)">
        <v-card-item>
          <div class="d-flex align-center justify-space-between ga-2">
            <h3 class="text-h6 font-weight-bold">{{ item.title }}</h3>
            <v-chip :color="statusChipColor(item)" size="small" :variant="statusChipVariant(item)">
              {{ statusLabel(item) }}
            </v-chip>
          </div>

          <p class="text-body-2 text-medium-emphasis mt-2">{{ item.description }}</p>
        </v-card-item>

        <v-divider />

        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-2">Endpoints</div>
          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip
              v-for="endpoint in item.endpoints"
              :key="endpoint"
              class="endpoint-chip"
              size="small"
              variant="outlined"
            >
              {{ endpoint }}
            </v-chip>
          </div>

          <div v-if="item.workflows && item.workflows.length > 0">
            <div class="text-caption text-medium-emphasis mb-2">Workflows especiais</div>
            <v-list class="pa-0 bg-transparent" density="compact">
              <v-list-item v-for="workflow in item.workflows" :key="workflow" prepend-icon="mdi-check-circle-outline">
                <v-list-item-title class="text-body-2">{{ workflow }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import type { CapabilityItem } from '@/types/capability'
  import { useSessionStore } from '@/stores/session'

  defineProps<{
    items: CapabilityItem[]
  }>()

  const session = useSessionStore()

  function canUse (item: CapabilityItem): boolean {
    const hasPermissionsAll = !item.permissionsAll || session.hasAllPermissions(item.permissionsAll)
    const hasPermissionsAny = !item.permissionsAny || session.hasAnyPermission(item.permissionsAny)
    const hasModulesAll = !item.modulesAll || session.hasAllModules(item.modulesAll)
    const hasModulesAny = !item.modulesAny || session.hasAnyModule(item.modulesAny)

    return hasPermissionsAll && hasPermissionsAny && hasModulesAll && hasModulesAny
  }

  function status (item: CapabilityItem): 'ready' | 'permission' | 'module' {
    if (item.modulesAll && !session.hasAllModules(item.modulesAll)) {
      return 'module'
    }

    if (item.modulesAny && !session.hasAnyModule(item.modulesAny)) {
      return 'module'
    }

    if (item.permissionsAll && !session.hasAllPermissions(item.permissionsAll)) {
      return 'permission'
    }

    if (item.permissionsAny && !session.hasAnyPermission(item.permissionsAny)) {
      return 'permission'
    }

    return canUse(item) ? 'ready' : 'permission'
  }

  function statusLabel (item: CapabilityItem): string {
    const currentStatus = status(item)
    if (currentStatus === 'module') return 'Bloqueado por plano'
    if (currentStatus === 'permission') return 'Sem permissão'
    return 'Disponível'
  }

  function statusChipColor (item: CapabilityItem): string {
    const currentStatus = status(item)
    if (currentStatus === 'module') return 'warning'
    if (currentStatus === 'permission') return 'error'
    return 'success'
  }

  function statusChipVariant (item: CapabilityItem): 'flat' | 'outlined' | 'tonal' {
    return status(item) === 'ready' ? 'flat' : 'tonal'
  }

  function statusColor (item: CapabilityItem): string | undefined {
    const currentStatus = status(item)
    if (currentStatus === 'module') return 'warning'
    if (currentStatus === 'permission') return 'error'
    return undefined
  }

  function statusVariant (item: CapabilityItem): 'elevated' | 'tonal' {
    return status(item) === 'ready' ? 'elevated' : 'tonal'
  }
</script>

<style scoped>
.endpoint-chip {
  font-family: var(--app-code-font);
}
</style>
