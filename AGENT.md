# AGENT.md - Frontend MOV FLOW

## Contexto do repositorio

Este repositorio contem o frontend do MOV FLOW.

- Stack principal: Vue 3, TypeScript, Vuetify 3, Vite
- Runtime: Node.js >= 22
- API alvo: MOV FLOW API (`/api/v1`)
- Autenticacao: JWT
- Autorizacao: RBAC por permissoes
- Gate de produto: modulos habilitados por tenant/plano

## Objetivo do agente

Executar mudancas pequenas e seguras, mantendo:

1. experiencia de uso clara e consistente
2. arquitetura de componentes escalavel
3. protecao de acesso por auth/permissao/modulo
4. codigo tipado, legivel e padronizado

## Escopo e limites

- Este repositorio e frontend-only.
- Nao alterar regras de negocio de backend por suposicao.
- Nao inventar endpoints; consumir apenas contratos existentes.
- Nao adicionar dependencia nova sem justificativa tecnica clara.
- Nao quebrar fluxo atual de autenticacao/sessao.

## Regras criticas de acesso

- Toda rota autenticada deve respeitar `requiresAuth`.
- Navegacao e UI devem respeitar:
  - `permissionsAll` / `permissionsAny`
  - `modulesAll` / `modulesAny`
- Nao exibir CTA de acao sem permissao correspondente.
- Em acesso negado, manter redirecionamento para `/forbidden`.

## Padrao de arquitetura

Fluxo preferido:

- `pages` -> `components` -> `services/api` -> `services/http`

Regras:

- `pages/` orquestram casos de uso da tela.
- `components/` devem ser reutilizaveis e de responsabilidade unica.
- `services/api/*` centralizam chamadas HTTP por dominio.
- `types/*` definem contratos de payload e resposta.
- Evitar logica pesada em template; preferir `script setup` com funcoes pequenas.

## Regras de UI/UX

Cada tela deve ter:

- contexto claro (titulo/subtitulo)
- estado de carregamento
- estado vazio
- estado de erro
- feedback de sucesso/falha em acoes de escrita

Formularios:

- labels objetivas
- validacao antes de submit
- bloqueio de reenvio durante `loading`
- mensagens de erro compreensiveis

Consistencia visual:

- usar tema/tokens do Vuetify e estilos globais do projeto
- evitar hardcode repetido de cores/espacamento
- manter componentes com hierarquia visual previsivel

Responsividade:

- validar layout desktop e mobile
- evitar overflow horizontal
- garantir navegacao funcional em telas menores

Acessibilidade minima:

- foco visivel
- contraste legivel
- texto acionavel claro em botoes e links
- sem dependencia exclusiva de cor para comunicar estado

## Convencoes de codigo

- Prettier e fonte da formatacao oficial.
- ESLint deve permanecer sem erros.
- Componentes em `PascalCase`.
- Funcoes/variaveis em `camelCase`.
- Tipos e interfaces em `PascalCase`.
- Nomes de arquivos devem refletir a responsabilidade.

Padrao Prettier atual:

- `semi: false`
- `singleQuote: true`
- `trailingComma: all`
- `printWidth: 100`
- `tabWidth: 2`

## Integracao com API

- Usar `services/api/*` para consumo HTTP.
- Tratar falhas com `ApiError` e retornar mensagem amigavel na UI.
- Nao duplicar regras de endpoint em varios lugares.
- Ao mudar contrato, atualizar `types/*` e consumidores da API juntos.

## Seguranca e dados

- Nao expor token em logs.
- Nao persistir dados sensiveis fora do fluxo previsto.
- Nao assumir permissao por visibilidade de menu; validar por guard e condicoes.

## Processo esperado

Antes de codar:

1. localizar pagina/componente/servico impactado
2. identificar padrao existente no modulo
3. escolher a menor mudanca segura

Durante a implementacao:

1. preservar auth + RBAC + modulos
2. manter consistencia visual e estrutural
3. evitar refactor amplo sem necessidade

Depois da implementacao:

1. revisar UX (loading/erro/vazio/sucesso)
2. revisar impactos de permissao e modulo
3. validar tipagem e lint

## Validacao minima

Quando aplicavel, executar:

1. `npm run format:check`
2. `npm run lint`
3. `npm run type-check`
4. `npm run build`

Se alguma validacao nao for executada, informar:

- o que nao foi executado
- por que nao foi executado
- risco remanescente
