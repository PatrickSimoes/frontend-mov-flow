# Frontend MOV FLOW

Frontend web do ecossistema MOV FLOW.

Aplicacao SaaS multi-tenant focada em operacao logistica, financeiro e billing, com controle de acesso por permissao (RBAC) e bloqueio por modulos habilitados no plano.

## Stack

- Vue 3 + TypeScript
- Vuetify 3
- Vue Router 4
- Vite 7
- ESLint (`eslint-config-vuetify`)
- Prettier

## Escopo funcional atual

- Fluxo publico:
  - login (`/login`)
  - registro inicial de tenant (`/register`)
- Area autenticada (`/app/*`):
  - dashboard de sessao/tenant/modulos
  - administrativo (usuarios, roles, permissoes, settings, auditoria)
  - operacoes (frota e logistica)
  - financeiro
  - billing SaaS (planos, assinatura, pagamentos, uso)
- Protecao por:
  - `requiresAuth` em rota
  - `permissionsAll` e `permissionsAny`
  - `modulesAll` e `modulesAny`

## Como rodar localmente

Pre-requisitos:

- Node.js 22+
- npm 10+
- API MOV FLOW rodando

Instalacao e execucao:

```bash
npm install
npm run dev
```

Build e preview:

```bash
npm run build
npm run preview
```

## Variaveis de ambiente

- `VITE_API_BASE_URL`: base da API.
  - default: `/api/v1`
  - exemplo: `http://localhost:3000/api/v1`

## Arquitetura de pastas

```text
src/
|-- assets/          # arquivos estaticos
|-- components/      # componentes reutilizaveis
|-- config/          # configuracoes do app (ex.: navegacao)
|-- layouts/         # estrutura de paginas autenticadas/publicas
|-- pages/           # telas por rota
|-- plugins/         # bootstrap de plugins (vuetify etc.)
|-- router/          # definicao de rotas e guards
|-- services/        # cliente HTTP e APIs por dominio
|-- stores/          # estado global (sessao)
|-- styles/          # temas e estilos globais
`-- types/           # contratos de dados
```

## Padrao de componentes

Para manter UI/UX consistente e codigo escalavel:

- `pages/` orquestram casos de uso da tela e chamadas de API.
- `components/` concentram blocos reutilizaveis e apresentacionais.
- `services/api/*` encapsulam acesso HTTP por dominio.
- `types/*` definem contratos tipados para payloads e responses.
- Evite logica de negocio em template; concentre em `script setup`.

## Diretrizes de UI/UX

- Navegacao deve refletir acesso real do usuario:
  - esconder itens sem permissao/modulo
  - bloquear rota com redirecionamento para `/forbidden` quando necessario
- Cada pagina deve ter:
  - titulo claro e contexto do dominio
  - estados de carregamento, vazio e erro
  - feedback de acao (sucesso/falha) sem ambiguidade
- Formularios:
  - labels objetivas
  - validacao antes de envio
  - botoes com estado `loading` durante requisicao
- Consistencia visual:
  - usar tokens/tema do Vuetify e estilos globais
  - evitar estilos inline repetidos
  - manter linguagem visual uniforme entre modulos
- Acessibilidade minima:
  - contraste legivel
  - foco visivel em elementos interativos
  - texto acionavel claro em botoes e links

## Qualidade de codigo

### Prettier

Padrao atual (`.prettierrc.json`):

- `semi: false`
- `singleQuote: true`
- `trailingComma: all`
- `printWidth: 100`
- `tabWidth: 2`

Comandos:

```bash
npm run format
npm run format:check
```

### ESLint e tipos

```bash
npm run lint
npm run type-check
```

### Validacao recomendada antes de PR

```bash
npm run format:check
npm run lint
npm run type-check
npm run build
```

## Convencoes de implementacao

- Nome de componentes em `PascalCase`.
- Composables/servicos com funcoes pequenas e foco unico.
- Evite duplicacao de chamadas HTTP; centralize em `services/api`.
- Trate erros de API com mensagem amigavel para o usuario.
- Nao exponha informacao sensivel em tela ou log.
- Nao criar dependencia nova sem justificativa tecnica clara.

## Relacao com o backend

- O frontend consome endpoints versionados da API (`/api/v1`).
- Permissoes e modulos habilitados devem ser respeitados na UI e na navegacao.
- Mudancas de contrato devem ser feitas com sincronizacao entre `types/` e `services/api/`.
