<template>
  <v-card class="mb-6" rounded="xl">
    <v-card-item subtitle="Contas, bancos, reconciliação e relatórios" title="Financeiro" />
    <v-card-text>
      <p class="text-body-2 text-medium-emphasis mb-4">
        O módulo financeiro combina CRUD e workflows de liquidação/baixa/recorrência. A UI precisa tratar
        ações de estado além das telas cadastrais.
      </p>

      <v-alert type="warning" variant="tonal">
        Workflows críticos: <code>pay</code>, <code>receive</code>, <code>adjust-balance</code>,
        <code>reconcile</code>, <code>mark-divergent</code> e geração de recorrência.
      </v-alert>
    </v-card-text>
  </v-card>

  <CapabilityGrid :items="financialCapabilities" />
</template>

<script setup lang="ts">
  import type { CapabilityItem } from '@/types/capability'
  import CapabilityGrid from '@/components/app/CapabilityGrid.vue'

  const financialCapabilities: CapabilityItem[] = [
    {
      title: 'Cadastros Mestres',
      description: 'Suppliers, customers, centros de custo, categorias e regras financeiras.',
      endpoints: [
        'POST/GET/PATCH /financial/master/suppliers',
        'POST/GET/PATCH /financial/master/customers',
        'POST/GET/PATCH /financial/master/cost-centers',
        'POST/GET/PATCH /financial/master/categories',
        'POST/GET/PATCH /financial/master/payment-methods',
        'POST/GET/PATCH /financial/master/chart-accounts',
        'POST/GET/PATCH /financial/master/recurrence-rules',
        'POST/GET/PATCH /financial/master/interest-fine-rules',
      ],
      permissionsAny: ['financial.master.read', 'financial.master.manage'],
      modulesAll: ['financial'],
    },
    {
      title: 'Contas a Pagar (AP)',
      description: 'Lançamento, atualização, cancelamento e pagamento de obrigações.',
      endpoints: [
        'POST /financial/accounts-payable',
        'GET /financial/accounts-payable',
        'PATCH /financial/accounts-payable/:id',
        'POST /financial/accounts-payable/:id/pay',
        'POST /financial/accounts-payable/:id/recurrence/generate',
        'POST /financial/accounts-payable/:id/attachments',
      ],
      workflows: ['Baixa/pagamento', 'Geração de recorrência', 'Upload de anexos'],
      permissionsAny: ['financial.read', 'financial.create', 'financial.update', 'financial.pay', 'financial.attachments.create'],
      modulesAll: ['financial'],
    },
    {
      title: 'Contas a Receber (AR)',
      description: 'Lançamento, atualização, recebimento e anexos de títulos.',
      endpoints: [
        'POST /financial/accounts-receivable',
        'GET /financial/accounts-receivable',
        'PATCH /financial/accounts-receivable/:id',
        'POST /financial/accounts-receivable/:id/receive',
        'POST /financial/accounts-receivable/:id/recurrence/generate',
        'POST /financial/accounts-receivable/:id/attachments',
      ],
      workflows: ['Recebimento', 'Geração de recorrência', 'Upload de anexos'],
      permissionsAny: ['financial.read', 'financial.create', 'financial.update', 'financial.receive', 'financial.attachments.create'],
      modulesAll: ['financial'],
    },
    {
      title: 'Contas Bancárias',
      description: 'Gestão de contas e ajustes de saldo.',
      endpoints: [
        'POST /financial/bank-accounts',
        'GET /financial/bank-accounts',
        'PATCH /financial/bank-accounts/:id',
        'POST /financial/bank-accounts/:id/adjust-balance',
      ],
      workflows: ['Ajuste manual de saldo'],
      permissionsAny: ['financial.bank-accounts.read', 'financial.bank-accounts.create', 'financial.bank-accounts.update', 'financial.bank-accounts.adjust-balance'],
      modulesAll: ['financial'],
    },
    {
      title: 'Reconciliação Bancária',
      description: 'Conciliação com fluxo de divergências e confirmação.',
      endpoints: [
        'POST /financial/reconciliation',
        'GET /financial/reconciliation',
        'PATCH /financial/reconciliation/:id',
        'POST /financial/reconciliation/:id/reconcile',
        'POST /financial/reconciliation/:id/mark-divergent',
      ],
      workflows: ['Reconciliação', 'Marcação de divergência'],
      permissionsAny: ['financial.reconciliation.read', 'financial.reconciliation.create', 'financial.reconciliation.update', 'financial.reconciliation.execute'],
      modulesAll: ['financial'],
    },
    {
      title: 'Fluxo de Caixa',
      description: 'Registro e consulta de movimentações no caixa consolidado.',
      endpoints: ['POST /financial/cash-flow', 'GET /financial/cash-flow', 'GET /financial/cash-flow/:id'],
      permissionsAny: ['financial.cash-flow.read', 'financial.cash-flow.create'],
      modulesAll: ['financial'],
    },
    {
      title: 'Relatórios e Dashboard',
      description: 'Visões analíticas de caixa, atraso e rentabilidade.',
      endpoints: [
        'GET /financial/reports/cash-flow',
        'GET /financial/reports/overdue',
        'GET /financial/reports/dashboard',
        'GET /financial/reports/shipment-profitability',
      ],
      permissionsAny: ['financial.reports.read', 'financial.dashboard.read'],
      modulesAll: ['financial'],
    },
  ]
</script>
