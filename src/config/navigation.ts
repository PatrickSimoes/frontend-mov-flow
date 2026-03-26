import type { ModuleCode } from '@/types/auth'

export interface NavItem {
  title: string
  subtitle: string
  to: string
  icon: string
  permissionsAny?: string[]
  permissionsAll?: string[]
  modulesAny?: ModuleCode[]
  modulesAll?: ModuleCode[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const MODULE_LABELS: Record<ModuleCode, string> = {
  logistics: 'Operacao',
  fleet: 'Frota',
  financial: 'Financeiro',
}

export const NAVIGATION: NavSection[] = [
  {
    title: 'Visao Geral',
    items: [
      {
        title: 'Painel',
        subtitle: 'Resumo da operacao, alertas e indicadores',
        to: '/app/dashboard',
        icon: 'mdi-view-dashboard-outline',
      },
    ],
  },
  {
    title: 'Operacao',
    items: [
      {
        title: 'Operacao',
        subtitle: 'Pedidos, entregas, frota e programacao',
        to: '/app/operations',
        icon: 'mdi-truck-fast-outline',
        permissionsAny: ['drivers.read', 'vehicles.read', 'orders.read', 'shipments.read'],
        modulesAny: ['fleet', 'logistics'],
      },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      {
        title: 'Financeiro',
        subtitle: 'Contas, bancos, conciliacao e fluxo de caixa',
        to: '/app/financial',
        icon: 'mdi-cash-multiple',
        permissionsAny: ['financial.read', 'financial.master.read', 'financial.reports.read'],
        modulesAll: ['financial'],
      },
      {
        title: 'Relatorios',
        subtitle: 'Desempenho operacional e financeiro',
        to: '/app/reports',
        icon: 'mdi-chart-line',
        permissionsAny: ['financial.reports.read', 'financial.dashboard.read'],
        modulesAll: ['financial'],
      },
      {
        title: 'Assinatura',
        subtitle: 'Plano atual, pagamentos e consumo',
        to: '/app/billing',
        icon: 'mdi-credit-card-outline',
        permissionsAny: ['saas.plans.read', 'saas.subscriptions.read', 'saas.payments.read'],
      },
    ],
  },
  {
    title: 'Gestao',
    items: [
      {
        title: 'Usuarios e Acessos',
        subtitle: 'Equipe, perfis, permissoes e auditoria',
        to: '/app/admin',
        icon: 'mdi-account-group-outline',
        permissionsAny: [
          'companies.read',
          'users.read',
          'roles.read',
          'permissions.read',
          'settings.read',
          'audit.logs.read',
        ],
      },
      {
        title: 'Configuracoes',
        subtitle: 'Preferencias gerais da empresa',
        to: '/app/settings',
        icon: 'mdi-cog-outline',
        permissionsAll: ['settings.read'],
      },
    ],
  },
]
