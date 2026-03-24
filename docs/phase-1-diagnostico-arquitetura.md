# Fase 1 - Diagnóstico e Arquitetura Alvo do Frontend

## 1) Escopo analisado

### Backend (fonte de verdade)

- API NestJS em `api-mov-flow/src`.
- Prefixo/versionamento: `/api/v1/*`.
- Guards globais: JWT + assinatura + módulo habilitado + permissões.
- Envelope padrão:
  - sucesso: `{ success: true, data }`
  - erro: `{ success: false, message, errors? }`

Arquivos-base inspecionados:

- `api-mov-flow/src/main.ts`
- `api-mov-flow/src/app.module.ts`
- `api-mov-flow/src/common/guards/permissions.guard.ts`
- `api-mov-flow/src/modules/saas/guards/module-access.guard.ts`
- `api-mov-flow/src/modules/saas/guards/subscription.guard.ts`
- controllers, DTOs, entities e services dos módulos de auth/admin/operação/financeiro/saas.

### Frontend beta

- App Vue/Vuetify em `frontend-mov-flow/src`.
- Estado atual: shell funcional + auth básico + billing parcial + páginas “capability grid” sem fluxos reais.

Arquivos-chave inspecionados:

- `frontend-mov-flow/src/router/index.ts`
- `frontend-mov-flow/src/stores/session.ts`
- `frontend-mov-flow/src/services/http.ts`
- `frontend-mov-flow/src/layouts/AuthenticatedLayout.vue`
- `frontend-mov-flow/src/pages/app/*.vue`

---

## 2) Diagnóstico do backend (inventário real)

## Módulos e cobertura de endpoints

- Total de endpoints REST encontrados em controllers: `154`.
- Públicos: `POST /auth/register`, `POST /auth/login`, `GET /health`, `POST /saas/stripe/webhook`.
- Protegidos: todos os demais, com `@Permissions` e, quando aplicável, `@ModuleAccess`.

Grupos cobertos:

- Auth, Health
- Tenants, Companies, Users, Roles, Permissions, User-Roles, Audit, Settings, Units
- Drivers, Driver-Payments, Vehicles, Vehicle-Maintenance, Orders, Routes, Route-Stops, Freight-Tables, Shipments, Fiscal Documents
- Financial: AP, AR, Bank Accounts, Reconciliation, Cash Flow, Master Data, Reports
- SaaS/Billing: Plans, Subscriptions, Payments, Usage, Tenant Modules, Stripe Webhook

## Regras críticas identificadas (impactam UX)

- `orders/:id/close`: só fecha com todos os shipments `DELIVERED`.
- `shipments/:id/status` para `DELIVERED`:
  - exige driver/vehicle válidos
  - pode gerar automaticamente AR e driver-payment
  - sincroniza status do pedido.
- `vehicle-maintenance/:id/complete`: pode gerar AP automaticamente.
- `driver-payments/:id/pay`: fluxo explícito de quitação.
- AP/AR:
  - pagamento/recebimento parcial/total (`pay`/`receive`)
  - aplicação de juros/multa
  - recorrência (`recurrence/generate`)
  - anexos (`attachments`).
- `bank-accounts/:id/adjust-balance`: ajuste manual de saldo.
- Reconciliation: `reconcile` e `mark-divergent`.

## Autorização e multi-tenant

- `tenantId` é sempre contexto de JWT (não deve ser campo de formulário).
- `PermissionsGuard`: rota protegida sem `@Permissions` falha com 403.
- `ModuleAccessGuard` + `SubscriptionGuard`:
  - módulos aplicados nas áreas `logistics`, `fleet`, `financial`.
  - assinatura atual precisa estar `ACTIVE` ou `TRIALING` para rotas com `@ModuleAccess`.

## Filtros e paginação

- DTOs de query existem para praticamente todas as listagens.
- Backend aceita `page` e `limit` (1..100).
- Observação importante: a maioria das listagens retorna apenas array de itens (sem `total`), apesar de aceitar paginação.

## Dependências entre domínios (impacto arquitetural)

- `orders` depende de `customers` (financeiro master data).
- `shipments` depende de `orders`, `drivers`, `vehicles`, `routes`, `freight-tables`, `settings`, `financial`.
- `vehicle-maintenance` conversa com AP.
- `driver-payments` conversa com shipments/drivers.
- Billing (plano/assinatura) impacta módulos habilitados e limites de uso.

## Lacunas/inconsistências de backend (para documentar no front)

- `units`: atualmente apenas `POST /units` (sem list/detail/update/delete).
- Listagens sem `total` dificultam paginação clássica de “última página”.
- `/auth/me` exige permissão `users.read`, o que pode bloquear bootstrap de perfis com RBAC muito restrito.

---

## 3) Diagnóstico do frontend beta

## O que pode ser reaproveitado

- Direção visual base (tema claro, shell com drawer/topbar) como ponto de partida.
- Tratamento de envelope da API em `services/http.ts`.
- Fluxo de login/registro/sessão (conceito), incluindo persistência de token.
- Parte do módulo de billing (consulta de planos/assinatura/pagamentos/uso + checkout).

## O que precisa ser descartado/refeito

- `stores/session.ts` (não usa Pinia, store singleton manual).
- Páginas `Admin`, `Operations` e `Financial` atuais: são descritivas, não operacionais.
- `CapabilityGrid` como padrão principal de módulo (serve só como documentação).
- Mapa de módulos tipado no front limitado; precisa alinhar com backend e estratégia de acesso.

## Problemas de arquitetura/UX detectados

- Sem organização real por domínio (falta estrutura escalável).
- Sem padrões produtivos de tabela/filtro/form/detalhe/confirm/feedback.
- Sem cobertura funcional dos fluxos especiais do backend.
- Sem camada robusta de autorização por recurso/ação no nível de componente.
- Navegação ainda rasa para ERP/SaaS denso.

---

## 4) Arquitetura proposta (alvo profissional)

## Estrutura de pastas

```text
src/
  app/
    providers/
    router/
    layouts/
    theme/
  core/
    http/
    auth/
    access/
    errors/
    utils/
    constants/
    types/
  shared/
    components/
      data-display/
      forms/
      feedback/
      navigation/
      overlays/
    composables/
    formatters/
    validators/
  modules/
    auth/
    dashboard/
    admin/
      tenant/
      companies/
      users/
      roles/
      permissions/
      user-roles/
      audit/
      settings/
      units/
    operations/
      drivers/
      driver-payments/
      vehicles/
      vehicle-maintenance/
      orders/
      routes/
      route-stops/
      freight-tables/
      shipments/
      fiscal-documents/
    financial/
      accounts-payable/
      accounts-receivable/
      bank-accounts/
      reconciliation/
      cash-flow/
      master-data/
      reports/
    billing/
      plans/
      subscription/
      payments/
      usage/
      modules/
```

## Router e navegação

- Rotas por domínio com lazy loading.
- Shell principal com:
  - menu lateral por capacidade (permissão + módulo)
  - header com busca contextual e ações rápidas
  - breadcrumbs dinâmicos por rota/meta
  - área de notificações/snackbar.

## Stores (Pinia)

- `authStore`: token, usuário, bootstrap, login/logout, sessão expirada.
- `accessStore`: permissões efetivas, módulos habilitados, helpers `can/canAny/canAll`.
- `appShellStore`: drawer, breadcrumbs, densidade visual, feedback global.
- Stores por domínio (somente onde houver estado compartilhado real):
  - `billingStore`
  - `financialFiltersStore` (filtros persistentes de telas densas)
  - demais módulos preferencialmente com composables de página para evitar overstore.

## HTTP e integração

- Cliente central em `core/http` com:
  - injeção de `Authorization: Bearer`
  - normalização de envelope de resposta
  - normalização de erro por tipo (`Validation`, `Unauthorized`, `Forbidden`, `Conflict`, `Unknown`)
  - interceptação de `401` (expirar sessão + redirecionamento)
  - tratamento unificado de `403` por permissão x módulo/plano.
- Serviços por domínio (contratos estritamente tipados por DTO/entidades do backend).

## Estratégia de autorização

- Rota:
  - `requiresAuth`
  - `permissionsAll|Any`
  - `modulesAll|Any` (para `logistics/fleet/financial`).
- Componente/ação:
  - diretiva/composable `v-can` e `useCan()`.
- UX para bloqueio:
  - `403 permissão`: tela “Acesso negado”.
  - `403 módulo/plano`: CTA de upgrade com contexto de billing.

## Design system e UX

- Tokens centralizados:
  - cor, spacing, radius, elevação, tipografia, estados.
- Componentes base reutilizáveis:
  - `AppPageHeader`
  - `AppDataTable`
  - `AppFilterBar`
  - `AppFormSection`
  - `AppConfirmDialog`
  - `StatusChip`
  - `EmptyState`
  - `ErrorState`
  - `SkeletonBlock`.
- Padrões de tela:
  - lista densa com filtros e ações
  - drawer de criação/edição
  - página de detalhe com timeline/eventos quando fizer sentido
  - feedback de sucesso/erro contextual.

---

## 5) Mapa de rotas alvo (alto nível)

- Público: `/login`, `/register`, `/forbidden`, `/not-found`.
- App:
  - `/app/dashboard`
  - `/app/admin/*`
  - `/app/operations/*`
  - `/app/financial/*`
  - `/app/billing/*`

Detalhamento principal:

- Admin:
  - `/app/admin/tenant`
  - `/app/admin/companies`
  - `/app/admin/users`
  - `/app/admin/roles`
  - `/app/admin/permissions`
  - `/app/admin/user-roles`
  - `/app/admin/audit`
  - `/app/admin/settings`
  - `/app/admin/units`
- Operations:
  - `/app/operations/drivers`
  - `/app/operations/driver-payments`
  - `/app/operations/vehicles`
  - `/app/operations/vehicle-maintenance`
  - `/app/operations/orders`
  - `/app/operations/routes`
  - `/app/operations/routes/:routeId/stops`
  - `/app/operations/freight-tables`
  - `/app/operations/shipments`
  - `/app/operations/fiscal-documents`
- Financial:
  - `/app/financial/accounts-payable`
  - `/app/financial/accounts-receivable`
  - `/app/financial/bank-accounts`
  - `/app/financial/reconciliation`
  - `/app/financial/cash-flow`
  - `/app/financial/master/*`
  - `/app/financial/reports/*`
- Billing:
  - `/app/billing/plans`
  - `/app/billing/subscription`
  - `/app/billing/payments`
  - `/app/billing/usage`
  - `/app/billing/modules`

---

## 6) Decisões de reaproveitamento/refatoração/recriação

- Reaproveitar:
  - base de Vuetify e direção visual inicial
  - cliente HTTP envelope-aware (com refatoração)
  - lógica de checkout e sessão como referência.
- Refatorar fortemente:
  - roteamento e guards
  - gestão de sessão/autorização
  - layout shell e nav.
- Recriar:
  - módulos administrativos, operacionais e financeiros (telas/fluxos reais).

---

## 7) Plano de execução (fases seguintes)

1. Fase 2: base técnica (Pinia, router modular, shell, theme tokens, componentes base, HTTP core).
2. Fase 3: autenticação e sessão robusta.
3. Fase 4: administrativo completo.
4. Fase 5: operação/logística com workflows especiais.
5. Fase 6: financeiro completo com AP/AR, conciliação e relatórios.
6. Fase 7: billing/saas com bloqueio por plano e upgrade UX.
7. Fase 8: refinamento final de UX/UI/consistência.

---

## 8) Checklist rastreável

- Checklist endpoint -> interface foi gerado em:
  - `frontend-mov-flow/docs/endpoint-coverage-checklist.md`
