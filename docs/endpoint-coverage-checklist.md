# Checklist de Cobertura - Endpoint -> Tela/Ação

Legenda:

- `Status beta`: `nao`, `parcial`, `sim`
- `Fase`: etapa planejada para implementação definitiva

## Público / Sistema

- [ ] `GET /api/v1/health` -> sem tela de negócio (monitoramento técnico) | Status beta: `nao` | Fase: `2`
- [ ] `POST /api/v1/saas/stripe/webhook` -> sem tela direta (impacta atualização de assinatura/pagamentos) | Status beta: `nao` | Fase: `7`

## Auth / Sessão

- [ ] `POST /api/v1/auth/register` -> `/register` (onboarding inicial do tenant) | Status beta: `sim` | Fase: `3`
- [ ] `POST /api/v1/auth/login` -> `/login` | Status beta: `sim` | Fase: `3`
- [ ] `GET /api/v1/auth/me` -> bootstrap de sessão (`authStore.initialize`) | Status beta: `parcial` | Fase: `3`

## Admin - Tenant / Governança

- [ ] `GET /api/v1/tenants/me` -> `/app/admin/tenant` (resumo do tenant) | Status beta: `parcial` | Fase: `4`
- [ ] `GET /api/v1/settings` -> `/app/admin/settings` | Status beta: `sim` | Fase: `4`
- [ ] `PATCH /api/v1/settings` -> `/app/admin/settings` (salvar configurações) | Status beta: `sim` | Fase: `4`
- [ ] `GET /api/v1/settings/audit` -> `/app/admin/settings` (aba histórico) | Status beta: `sim` | Fase: `4`
- [ ] `GET /api/v1/audit/logs` -> `/app/admin/audit` (listagem com filtros) | Status beta: `nao` | Fase: `4`
- [ ] `POST /api/v1/units` -> `/app/admin/units` (cadastro create-only) | Status beta: `nao` | Fase: `4`

## Admin - Empresas

- [ ] `POST /api/v1/companies` -> `/app/admin/companies` (criar) | Status beta: `nao` | Fase: `4`
- [ ] `GET /api/v1/companies` -> `/app/admin/companies` (lista paginada) | Status beta: `nao` | Fase: `4`
- [ ] `GET /api/v1/companies/:id` -> `/app/admin/companies/:id` (detalhe) | Status beta: `nao` | Fase: `4`
- [ ] `PATCH /api/v1/companies/:id` -> `/app/admin/companies` (editar) | Status beta: `nao` | Fase: `4`
- [ ] `DELETE /api/v1/companies/:id` -> `/app/admin/companies` (remover com confirmação) | Status beta: `nao` | Fase: `4`

## Admin - Usuários / RBAC

- [ ] `POST /api/v1/users` -> `/app/admin/users` (criar) | Status beta: `nao` | Fase: `4`
- [ ] `GET /api/v1/users` -> `/app/admin/users` (lista) | Status beta: `nao` | Fase: `4`
- [ ] `GET /api/v1/users/:id` -> `/app/admin/users/:id` (detalhe) | Status beta: `nao` | Fase: `4`
- [ ] `PATCH /api/v1/users/:id` -> `/app/admin/users` (editar/ativar/desativar) | Status beta: `nao` | Fase: `4`
- [ ] `DELETE /api/v1/users/:id` -> `/app/admin/users` (remoção) | Status beta: `nao` | Fase: `4`

- [ ] `POST /api/v1/roles` -> `/app/admin/roles` (criar role + permissões) | Status beta: `nao` | Fase: `4`
- [ ] `GET /api/v1/roles` -> `/app/admin/roles` (lista com rolePermissions) | Status beta: `nao` | Fase: `4`
- [ ] `GET /api/v1/roles/:id` -> `/app/admin/roles/:id` (detalhe) | Status beta: `nao` | Fase: `4`
- [ ] `PATCH /api/v1/roles/:id` -> `/app/admin/roles` (editar/sincronizar permissões) | Status beta: `nao` | Fase: `4`
- [ ] `DELETE /api/v1/roles/:id` -> `/app/admin/roles` (remover role) | Status beta: `nao` | Fase: `4`

- [ ] `POST /api/v1/permissions` -> `/app/admin/permissions` (criar) | Status beta: `nao` | Fase: `4`
- [ ] `GET /api/v1/permissions` -> `/app/admin/permissions` (lista) | Status beta: `nao` | Fase: `4`
- [ ] `GET /api/v1/permissions/:id` -> `/app/admin/permissions/:id` (detalhe) | Status beta: `nao` | Fase: `4`
- [ ] `PATCH /api/v1/permissions/:id` -> `/app/admin/permissions` (editar) | Status beta: `nao` | Fase: `4`
- [ ] `DELETE /api/v1/permissions/:id` -> `/app/admin/permissions` (remover) | Status beta: `nao` | Fase: `4`

- [ ] `POST /api/v1/user-roles` -> `/app/admin/user-roles` (vincular usuário x role) | Status beta: `nao` | Fase: `4`
- [ ] `GET /api/v1/user-roles` -> `/app/admin/user-roles` (listar vínculos) | Status beta: `nao` | Fase: `4`
- [ ] `DELETE /api/v1/user-roles/:id` -> `/app/admin/user-roles` (desvincular) | Status beta: `nao` | Fase: `4`

## Operações - Drivers / Fleet

- [ ] `POST /api/v1/drivers` -> `/app/operations/drivers` (criar) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/drivers` -> `/app/operations/drivers` (lista com busca) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/drivers/:id` -> `/app/operations/drivers/:id` | Status beta: `nao` | Fase: `5`
- [ ] `PATCH /api/v1/drivers/:id` -> `/app/operations/drivers` (editar/ativar) | Status beta: `nao` | Fase: `5`
- [ ] `DELETE /api/v1/drivers/:id` -> `/app/operations/drivers` (remover) | Status beta: `nao` | Fase: `5`

- [ ] `POST /api/v1/vehicles` -> `/app/operations/vehicles` (criar) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/vehicles` -> `/app/operations/vehicles` (lista com filtros) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/vehicles/:id` -> `/app/operations/vehicles/:id` | Status beta: `nao` | Fase: `5`
- [ ] `PATCH /api/v1/vehicles/:id` -> `/app/operations/vehicles` (editar status/tipo) | Status beta: `nao` | Fase: `5`
- [ ] `DELETE /api/v1/vehicles/:id` -> `/app/operations/vehicles` (remover) | Status beta: `nao` | Fase: `5`

- [ ] `POST /api/v1/vehicle-maintenance` -> `/app/operations/vehicle-maintenance` (agendar/cadastrar) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/vehicle-maintenance` -> `/app/operations/vehicle-maintenance` (lista) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/vehicle-maintenance/:id` -> `/app/operations/vehicle-maintenance/:id` | Status beta: `nao` | Fase: `5`
- [ ] `PATCH /api/v1/vehicle-maintenance/:id` -> `/app/operations/vehicle-maintenance` (editar) | Status beta: `nao` | Fase: `5`
- [ ] `POST /api/v1/vehicle-maintenance/:id/complete` -> `/app/operations/vehicle-maintenance` (workflow concluir + opcional AP) | Status beta: `nao` | Fase: `5`
- [ ] `DELETE /api/v1/vehicle-maintenance/:id` -> `/app/operations/vehicle-maintenance` (remover) | Status beta: `nao` | Fase: `5`

- [ ] `POST /api/v1/driver-payments` -> `/app/operations/driver-payments` (criar) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/driver-payments` -> `/app/operations/driver-payments` (lista por status/driver) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/driver-payments/:id` -> `/app/operations/driver-payments/:id` | Status beta: `nao` | Fase: `5`
- [ ] `PATCH /api/v1/driver-payments/:id` -> `/app/operations/driver-payments` (editar) | Status beta: `nao` | Fase: `5`
- [ ] `POST /api/v1/driver-payments/:id/pay` -> `/app/operations/driver-payments` (workflow pay) | Status beta: `nao` | Fase: `5`
- [ ] `DELETE /api/v1/driver-payments/:id` -> `/app/operations/driver-payments` (cancelar/remover) | Status beta: `nao` | Fase: `5`

## Operações - Logística

- [ ] `POST /api/v1/orders` -> `/app/operations/orders` (criar pedido) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/orders` -> `/app/operations/orders` (lista com filtros) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/orders/:id` -> `/app/operations/orders/:id` | Status beta: `nao` | Fase: `5`
- [ ] `PATCH /api/v1/orders/:id` -> `/app/operations/orders` (editar) | Status beta: `nao` | Fase: `5`
- [ ] `POST /api/v1/orders/:id/close` -> `/app/operations/orders` (workflow close) | Status beta: `nao` | Fase: `5`
- [ ] `DELETE /api/v1/orders/:id` -> `/app/operations/orders` (remover) | Status beta: `nao` | Fase: `5`

- [ ] `POST /api/v1/routes` -> `/app/operations/routes` (criar rota) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/routes` -> `/app/operations/routes` (lista com busca) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/routes/:id` -> `/app/operations/routes/:id` (detalhe) | Status beta: `nao` | Fase: `5`
- [ ] `PATCH /api/v1/routes/:id` -> `/app/operations/routes` (editar) | Status beta: `nao` | Fase: `5`
- [ ] `DELETE /api/v1/routes/:id` -> `/app/operations/routes` (remover) | Status beta: `nao` | Fase: `5`

- [ ] `POST /api/v1/routes/:routeId/stops` -> `/app/operations/routes/:routeId/stops` (criar parada) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/routes/:routeId/stops` -> `/app/operations/routes/:routeId/stops` (listar paradas) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/routes/:routeId/stops/:id` -> `/app/operations/routes/:routeId/stops/:id` | Status beta: `nao` | Fase: `5`
- [ ] `PATCH /api/v1/routes/:routeId/stops/:id` -> `/app/operations/routes/:routeId/stops` (editar parada) | Status beta: `nao` | Fase: `5`
- [ ] `DELETE /api/v1/routes/:routeId/stops/:id` -> `/app/operations/routes/:routeId/stops` (remover parada) | Status beta: `nao` | Fase: `5`

- [ ] `POST /api/v1/freight-tables` -> `/app/operations/freight-tables` (criar regra) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/freight-tables` -> `/app/operations/freight-tables` (lista por região/tipo) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/freight-tables/:id` -> `/app/operations/freight-tables/:id` | Status beta: `nao` | Fase: `5`
- [ ] `PATCH /api/v1/freight-tables/:id` -> `/app/operations/freight-tables` (editar) | Status beta: `nao` | Fase: `5`
- [ ] `DELETE /api/v1/freight-tables/:id` -> `/app/operations/freight-tables` (remover) | Status beta: `nao` | Fase: `5`

- [ ] `POST /api/v1/shipments` -> `/app/operations/shipments` (criar expedição) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/shipments` -> `/app/operations/shipments` (lista com filtros) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/shipments/:id` -> `/app/operations/shipments/:id` | Status beta: `nao` | Fase: `5`
- [ ] `PATCH /api/v1/shipments/:id` -> `/app/operations/shipments` (editar) | Status beta: `nao` | Fase: `5`
- [ ] `PATCH /api/v1/shipments/:id/status` -> `/app/operations/shipments` (workflow status) | Status beta: `nao` | Fase: `5`
- [ ] `DELETE /api/v1/shipments/:id` -> `/app/operations/shipments` (remover) | Status beta: `nao` | Fase: `5`

- [ ] `POST /api/v1/fiscal/documents` -> `/app/operations/fiscal-documents` (criar doc) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/fiscal/documents` -> `/app/operations/fiscal-documents` (lista) | Status beta: `nao` | Fase: `5`
- [ ] `GET /api/v1/fiscal/documents/:id` -> `/app/operations/fiscal-documents/:id` | Status beta: `nao` | Fase: `5`
- [ ] `PATCH /api/v1/fiscal/documents/:id` -> `/app/operations/fiscal-documents` (editar) | Status beta: `nao` | Fase: `5`
- [ ] `DELETE /api/v1/fiscal/documents/:id` -> `/app/operations/fiscal-documents` (remover) | Status beta: `nao` | Fase: `5`

## Financeiro - AP

- [ ] `POST /api/v1/financial/accounts-payable` -> `/app/financial/accounts-payable` (criar/parcelar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/accounts-payable` -> `/app/financial/accounts-payable` (lista com filtros) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/accounts-payable/:id` -> `/app/financial/accounts-payable/:id` | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/accounts-payable/:id` -> `/app/financial/accounts-payable` (editar) | Status beta: `nao` | Fase: `6`
- [ ] `DELETE /api/v1/financial/accounts-payable/:id` -> `/app/financial/accounts-payable` (cancelar) | Status beta: `nao` | Fase: `6`
- [ ] `POST /api/v1/financial/accounts-payable/:id/pay` -> `/app/financial/accounts-payable` (workflow pay) | Status beta: `nao` | Fase: `6`
- [ ] `POST /api/v1/financial/accounts-payable/:id/recurrence/generate` -> `/app/financial/accounts-payable` (workflow recorrência) | Status beta: `nao` | Fase: `6`
- [ ] `POST /api/v1/financial/accounts-payable/:id/attachments` -> `/app/financial/accounts-payable/:id` (anexar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/accounts-payable/:id/attachments` -> `/app/financial/accounts-payable/:id` (listar anexos) | Status beta: `nao` | Fase: `6`

## Financeiro - AR

- [ ] `POST /api/v1/financial/accounts-receivable` -> `/app/financial/accounts-receivable` (criar/parcelar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/accounts-receivable` -> `/app/financial/accounts-receivable` (lista com filtros) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/accounts-receivable/:id` -> `/app/financial/accounts-receivable/:id` | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/accounts-receivable/:id` -> `/app/financial/accounts-receivable` (editar) | Status beta: `nao` | Fase: `6`
- [ ] `DELETE /api/v1/financial/accounts-receivable/:id` -> `/app/financial/accounts-receivable` (cancelar) | Status beta: `nao` | Fase: `6`
- [ ] `POST /api/v1/financial/accounts-receivable/:id/receive` -> `/app/financial/accounts-receivable` (workflow receive) | Status beta: `nao` | Fase: `6`
- [ ] `POST /api/v1/financial/accounts-receivable/:id/recurrence/generate` -> `/app/financial/accounts-receivable` (workflow recorrência) | Status beta: `nao` | Fase: `6`
- [ ] `POST /api/v1/financial/accounts-receivable/:id/attachments` -> `/app/financial/accounts-receivable/:id` (anexar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/accounts-receivable/:id/attachments` -> `/app/financial/accounts-receivable/:id` (listar anexos) | Status beta: `nao` | Fase: `6`

## Financeiro - Bancos / Conciliação / Caixa

- [ ] `POST /api/v1/financial/bank-accounts` -> `/app/financial/bank-accounts` (criar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/bank-accounts` -> `/app/financial/bank-accounts` (lista) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/bank-accounts/:id` -> `/app/financial/bank-accounts/:id` | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/bank-accounts/:id` -> `/app/financial/bank-accounts` (editar/default) | Status beta: `nao` | Fase: `6`
- [ ] `POST /api/v1/financial/bank-accounts/:id/adjust-balance` -> `/app/financial/bank-accounts` (workflow ajuste) | Status beta: `nao` | Fase: `6`
- [ ] `DELETE /api/v1/financial/bank-accounts/:id` -> `/app/financial/bank-accounts` (remover) | Status beta: `nao` | Fase: `6`

- [ ] `POST /api/v1/financial/reconciliation` -> `/app/financial/reconciliation` (criar item) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/reconciliation` -> `/app/financial/reconciliation` (lista por status) | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/reconciliation/:id` -> `/app/financial/reconciliation` (editar item) | Status beta: `nao` | Fase: `6`
- [ ] `POST /api/v1/financial/reconciliation/:id/reconcile` -> `/app/financial/reconciliation` (workflow reconcile) | Status beta: `nao` | Fase: `6`
- [ ] `POST /api/v1/financial/reconciliation/:id/mark-divergent` -> `/app/financial/reconciliation` (workflow divergent) | Status beta: `nao` | Fase: `6`

- [ ] `POST /api/v1/financial/cash-flow` -> `/app/financial/cash-flow` (lançamento manual) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/cash-flow` -> `/app/financial/cash-flow` (lista) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/cash-flow/:id` -> `/app/financial/cash-flow/:id` | Status beta: `nao` | Fase: `6`

## Financeiro - Master Data

- [ ] `POST /api/v1/financial/master/suppliers` -> `/app/financial/master/suppliers` (criar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/master/suppliers` -> `/app/financial/master/suppliers` (lista) | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/master/suppliers/:id` -> `/app/financial/master/suppliers` (editar) | Status beta: `nao` | Fase: `6`

- [ ] `POST /api/v1/financial/master/customers` -> `/app/financial/master/customers` (criar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/master/customers` -> `/app/financial/master/customers` (lista) | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/master/customers/:id` -> `/app/financial/master/customers` (editar) | Status beta: `nao` | Fase: `6`

- [ ] `POST /api/v1/financial/master/cost-centers` -> `/app/financial/master/cost-centers` (criar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/master/cost-centers` -> `/app/financial/master/cost-centers` (lista) | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/master/cost-centers/:id` -> `/app/financial/master/cost-centers` (editar) | Status beta: `nao` | Fase: `6`

- [ ] `POST /api/v1/financial/master/categories` -> `/app/financial/master/categories` (criar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/master/categories` -> `/app/financial/master/categories` (lista) | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/master/categories/:id` -> `/app/financial/master/categories` (editar) | Status beta: `nao` | Fase: `6`

- [ ] `POST /api/v1/financial/master/payment-methods` -> `/app/financial/master/payment-methods` (criar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/master/payment-methods` -> `/app/financial/master/payment-methods` (lista) | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/master/payment-methods/:id` -> `/app/financial/master/payment-methods` (editar) | Status beta: `nao` | Fase: `6`

- [ ] `POST /api/v1/financial/master/chart-accounts` -> `/app/financial/master/chart-accounts` (criar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/master/chart-accounts` -> `/app/financial/master/chart-accounts` (lista) | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/master/chart-accounts/:id` -> `/app/financial/master/chart-accounts` (editar) | Status beta: `nao` | Fase: `6`

- [ ] `POST /api/v1/financial/master/recurrence-rules` -> `/app/financial/master/recurrence-rules` (criar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/master/recurrence-rules` -> `/app/financial/master/recurrence-rules` (lista) | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/master/recurrence-rules/:id` -> `/app/financial/master/recurrence-rules` (editar) | Status beta: `nao` | Fase: `6`

- [ ] `POST /api/v1/financial/master/interest-fine-rules` -> `/app/financial/master/interest-fine-rules` (criar) | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/master/interest-fine-rules` -> `/app/financial/master/interest-fine-rules` (lista) | Status beta: `nao` | Fase: `6`
- [ ] `PATCH /api/v1/financial/master/interest-fine-rules/:id` -> `/app/financial/master/interest-fine-rules` (editar) | Status beta: `nao` | Fase: `6`

## Financeiro - Relatórios

- [ ] `GET /api/v1/financial/reports/cash-flow` -> `/app/financial/reports/cash-flow` | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/reports/overdue` -> `/app/financial/reports/overdue` | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/reports/dashboard` -> `/app/financial/reports/dashboard` | Status beta: `nao` | Fase: `6`
- [ ] `GET /api/v1/financial/reports/shipment-profitability` -> `/app/financial/reports/shipment-profitability` | Status beta: `nao` | Fase: `6`

## Billing / SaaS

- [ ] `GET /api/v1/saas/plans` -> `/app/billing/plans` (catálogo) | Status beta: `sim` | Fase: `7`
- [ ] `GET /api/v1/saas/subscriptions/current` -> `/app/billing/subscription` | Status beta: `sim` | Fase: `7`
- [ ] `POST /api/v1/saas/subscriptions/checkout` -> `/app/billing/plans` (iniciar checkout) | Status beta: `sim` | Fase: `7`
- [ ] `GET /api/v1/saas/payments` -> `/app/billing/payments` (histórico) | Status beta: `sim` | Fase: `7`
- [ ] `GET /api/v1/saas/usage` -> `/app/billing/usage` (consumo por período) | Status beta: `sim` | Fase: `7`
- [ ] `GET /api/v1/saas/tenant-modules/enabled` -> `/app/billing/modules` + gating de menu/rotas | Status beta: `parcial` | Fase: `7`

## Observações obrigatórias de cobertura

- [ ] Todos endpoints com `workflow` especial terão UX dedicada (não só botão genérico):
  - `orders.close`
  - `shipments.update-status`
  - `driver-payments.pay`
  - `vehicle-maintenance.complete`
  - `financial.pay`
  - `financial.receive`
  - `financial.reconciliation.execute`
  - `financial.bank-accounts.adjust-balance`
  - `financial.recurrence.generate`
  - `financial.attachments.create/read`
- [ ] Endpoints sem tela direta documentados:
  - `GET /health` (observabilidade)
  - `POST /saas/stripe/webhook` (assíncrono, impacto em billing)
