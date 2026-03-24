# Implementação Final - Frontend Mov Flow

## Arquitetura entregue

- `Vue 3 + TypeScript + Vuetify + Vue Router + Pinia`.
- Cliente HTTP centralizado em `src/core/http/client.ts` com:
  - bearer token
  - parsing de envelope `{ success, data }`
  - tratamento de erro normalizado (`ApiError`)
  - hook global de `401`.
- Autenticação centralizada em `src/stores/auth.ts`:
  - login/register/logout
  - bootstrap de sessão
  - `/auth/me`, `/tenants/me`, `/saas/tenant-modules/enabled`
  - helpers de permissão e módulo.
- Shell principal em `src/layouts/AuthenticatedLayout.vue`:
  - menu lateral por domínio
  - breadcrumbs
  - menu de usuário
  - snackbar e confirmação globais.
- Design system base compartilhado em `src/shared/components/*`.

## Cobertura funcional

### Público / sessão

- `/login`
- `/register`
- `/forbidden`
- `/not-found`

### Core protegido

- `/app/dashboard`
- `/app/admin/tenant`
- `/app/admin/settings`

### CRUD/workflow genérico por recurso

Página única reutilizável: `src/pages/app/ResourceCrudPage.vue`.

Recursos admin:

- `/app/admin/companies`
- `/app/admin/users`
- `/app/admin/roles`
- `/app/admin/permissions`
- `/app/admin/user-roles`
- `/app/admin/units`
- `/app/admin/audit`

Recursos operação:

- `/app/operations/drivers`
- `/app/operations/driver-payments` (+ ação `pay`)
- `/app/operations/vehicles`
- `/app/operations/vehicle-maintenance` (+ ação `complete`)
- `/app/operations/orders` (+ ação `close`)
- `/app/operations/routes`
- `/app/operations/routes/:routeId/stops`
- `/app/operations/freight-tables`
- `/app/operations/shipments` (+ ação `update status`)
- `/app/operations/fiscal-documents`

Recursos financeiro:

- `/app/financial/accounts-payable` (+ `pay`, `recurrence/generate`, anexos)
- `/app/financial/accounts-receivable` (+ `receive`, `recurrence/generate`, anexos)
- `/app/financial/bank-accounts` (+ `adjust-balance`)
- `/app/financial/reconciliation` (+ `reconcile`, `mark-divergent`)
- `/app/financial/cash-flow`
- `/app/financial/master/suppliers`
- `/app/financial/master/customers`
- `/app/financial/master/cost-centers`
- `/app/financial/master/categories`
- `/app/financial/master/payment-methods`
- `/app/financial/master/chart-accounts`
- `/app/financial/master/recurrence-rules`
- `/app/financial/master/interest-fine-rules`

### Relatórios

Página reutilizável: `src/pages/app/ReportViewPage.vue`.

- `/app/financial/reports/cash-flow`
- `/app/financial/reports/overdue`
- `/app/financial/reports/dashboard`
- `/app/financial/reports/shipment-profitability`

### Billing SaaS

- `/app/billing/plans`
- `/app/billing/subscription`
- `/app/billing/payments`
- `/app/billing/usage`
- `/app/billing/modules`

## Regras de acesso e segurança aplicadas

- Guards de rota por autenticação.
- Guards de rota por permissões (`permissionsAll|Any`).
- Guards de rota por módulo (`modulesAll|Any`), respeitando contexto de assinatura.
- Menus e ações condicionados por permissões e módulos.
- Token JWT enviado via `Authorization: Bearer`.

## Dependências/lacunas de backend observadas

- `POST /units` é create-only (sem listagem/edição/exclusão): UI adaptada.
- `GET /health` e `POST /saas/stripe/webhook` não exigem tela direta; impacto tratado via UX de billing.
- Algumas listagens do backend aceitam paginação sem retornar `total`; a UI aplica fallback de paginação.
