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
  logistics: 'Logística',
  fleet: 'Frota',
  financial: 'Financeiro',
}

export const NAVIGATION: NavSection[] = [
  {
    title: 'Visão Geral',
    items: [
      {
        title: 'Dashboard',
        subtitle: 'Status da sessão, tenant e módulos ativos',
        to: '/app/dashboard',
        icon: 'mdi-view-dashboard-outline',
      },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        title: 'Administrativo',
        subtitle: 'Tenant, usuários, roles, permissões e auditoria',
        to: '/app/admin',
        icon: 'mdi-shield-account-outline',
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
        title: 'Configurações',
        subtitle: 'Moeda, juros, multa e regras padrão do tenant',
        to: '/app/settings',
        icon: 'mdi-cog-outline',
        permissionsAll: ['settings.read'],
      },
    ],
  },
  {
    title: 'Execução',
    items: [
      {
        title: 'Operações',
        subtitle: 'Frota, logística, expedição e documentos fiscais',
        to: '/app/operations',
        icon: 'mdi-truck-fast-outline',
        permissionsAny: ['drivers.read', 'vehicles.read', 'orders.read', 'shipments.read'],
        modulesAny: ['fleet', 'logistics'],
      },
      {
        title: 'Financeiro',
        subtitle: 'AP/AR, bancos, reconciliação e relatórios',
        to: '/app/financial',
        icon: 'mdi-cash-multiple',
        permissionsAny: ['financial.read', 'financial.master.read', 'financial.reports.read'],
        modulesAll: ['financial'],
      },
      {
        title: 'Billing SaaS',
        subtitle: 'Planos, assinatura, pagamentos e consumo',
        to: '/app/billing',
        icon: 'mdi-credit-card-outline',
        permissionsAny: ['saas.plans.read', 'saas.subscriptions.read', 'saas.payments.read'],
      },
    ],
  },
]
