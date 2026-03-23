<template>
  <v-card class="mb-6" rounded="xl">
    <v-card-item subtitle="Frota, logística e execução de entregas" title="Operações Logísticas" />
    <v-card-text>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Esta área combina recursos dos módulos <strong>fleet</strong> e <strong>logistics</strong>. Além de CRUD,
        existem ações de workflow que precisam de botões/estados dedicados na UI.
      </p>

      <v-alert type="warning" variant="tonal">
        Workflows críticos: <code>orders/:id/close</code>, <code>shipments/:id/status</code>,
        <code>driver-payments/:id/pay</code> e <code>vehicle-maintenance/:id/complete</code>.
      </v-alert>
    </v-card-text>
  </v-card>

  <CapabilityGrid :items="operationsCapabilities" />
</template>

<script setup lang="ts">
  import type { CapabilityItem } from '@/types/capability'
  import CapabilityGrid from '@/components/app/CapabilityGrid.vue'

  const operationsCapabilities: CapabilityItem[] = [
    {
      title: 'Motoristas',
      description: 'Cadastro e gestão de motoristas da operação.',
      endpoints: ['POST /drivers', 'GET /drivers', 'PATCH /drivers/:id', 'DELETE /drivers/:id'],
      permissionsAny: ['drivers.read', 'drivers.create', 'drivers.update', 'drivers.delete'],
      modulesAll: ['fleet'],
    },
    {
      title: 'Veículos',
      description: 'Cadastro de veículos com filtros por status e tipo.',
      endpoints: ['POST /vehicles', 'GET /vehicles', 'PATCH /vehicles/:id', 'DELETE /vehicles/:id'],
      permissionsAny: ['vehicles.read', 'vehicles.create', 'vehicles.update', 'vehicles.delete'],
      modulesAll: ['fleet'],
    },
    {
      title: 'Manutenção',
      description: 'Agenda/histórico e conclusão com impacto financeiro opcional.',
      endpoints: [
        'POST /vehicle-maintenance',
        'GET /vehicle-maintenance',
        'PATCH /vehicle-maintenance/:id',
        'POST /vehicle-maintenance/:id/complete',
      ],
      workflows: ['Conclusão técnica de manutenção', 'Possível geração automática de conta a pagar'],
      permissionsAny: [
        'vehicle-maintenance.read',
        'vehicle-maintenance.create',
        'vehicle-maintenance.update',
        'vehicle-maintenance.complete',
      ],
      modulesAll: ['fleet'],
    },
    {
      title: 'Pagamentos de Motorista',
      description: 'Controle de pagamentos com ação explícita de quitação.',
      endpoints: ['POST /driver-payments', 'GET /driver-payments', 'PATCH /driver-payments/:id', 'POST /driver-payments/:id/pay'],
      workflows: ['Fluxo pay para registrar pagamento efetivo'],
      permissionsAny: ['driver-payments.read', 'driver-payments.create', 'driver-payments.update', 'driver-payments.pay'],
      modulesAll: ['fleet'],
    },
    {
      title: 'Pedidos',
      description: 'Gestão de ordens com fechamento operacional.',
      endpoints: ['POST /orders', 'GET /orders', 'PATCH /orders/:id', 'POST /orders/:id/close'],
      workflows: ['Ação close para encerrar pedido'],
      permissionsAny: ['orders.read', 'orders.create', 'orders.update', 'orders.close'],
      modulesAll: ['logistics'],
    },
    {
      title: 'Rotas e Paradas',
      description: 'Planejamento de rotas com pontos de parada.',
      endpoints: [
        'POST /routes',
        'GET /routes',
        'PATCH /routes/:id',
        'POST /routes/:routeId/stops',
        'PATCH /routes/:routeId/stops/:id',
      ],
      permissionsAny: [
        'routes.read',
        'routes.create',
        'routes.update',
        'route-stops.read',
        'route-stops.create',
        'route-stops.update',
      ],
      modulesAll: ['logistics'],
    },
    {
      title: 'Tabelas de Frete',
      description: 'Regras de frete por região, tipo de veículo e peso.',
      endpoints: ['POST /freight-tables', 'GET /freight-tables', 'PATCH /freight-tables/:id', 'DELETE /freight-tables/:id'],
      permissionsAny: ['freight-tables.read', 'freight-tables.create', 'freight-tables.update', 'freight-tables.delete'],
      modulesAll: ['logistics'],
    },
    {
      title: 'Shipments / Expedição',
      description: 'Expedição com vínculo a pedido, frota, rota e tabela de frete.',
      endpoints: ['POST /shipments', 'GET /shipments', 'PATCH /shipments/:id', 'PATCH /shipments/:id/status'],
      workflows: ['Atualização de status operacional do shipment'],
      permissionsAny: ['shipments.read', 'shipments.create', 'shipments.update', 'shipments.update-status'],
      modulesAll: ['logistics'],
    },
    {
      title: 'Documentos Fiscais',
      description: 'Gestão de documentos fiscais atrelados ao shipment.',
      endpoints: ['POST /fiscal/documents', 'GET /fiscal/documents', 'PATCH /fiscal/documents/:id', 'DELETE /fiscal/documents/:id'],
      permissionsAny: ['fiscal.read', 'fiscal.create', 'fiscal.update', 'fiscal.delete'],
      modulesAll: ['logistics'],
    },
  ]
</script>
