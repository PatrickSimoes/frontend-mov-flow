# Frontend MOV FLOW

Frontend web do ecossistema MOV FLOW.

## Stack

- Vue 3 + TypeScript
- Vuetify 3
- Vue Router 4
- Vite 7

## Escopo funcional atual

- Login e registro inicial
- Area autenticada com:
  - Painel
  - Operacao
  - Financeiro
  - Relatorios
  - Assinatura
  - Usuarios e configuracoes
- Controle de acesso por permissao e modulo habilitado

## Executar em desenvolvimento

```bash
npm install
npm run dev
```

Por padrao, o frontend consome:

- `VITE_API_BASE_URL=/api/v1`

e usa proxy do Vite para `http://localhost:3000` em ambiente local.

## Build

```bash
npm run build
npm run preview
```

## Publicacao com Docker

### 1) Ambiente de build

Opcionalmente, crie:

```bash
cp .env.production.example .env.production
```

### 2) Build da imagem

```bash
docker build -t mov-flow-frontend:latest .
```

### 3) Execucao

```bash
docker run -p 8080:80 mov-flow-frontend:latest
```

O Nginx do container serve a SPA e encaminha `/api/*` para o servico `api`
quando usado junto com o `docker-compose.prod.yml` do repositorio pai.

## Estrutura

```text
src/
|-- components/
|-- config/
|-- layouts/
|-- pages/
|-- router/
|-- services/
|-- stores/
`-- types/
```

## Qualidade

```bash
npm run format:check
npm run lint
npm run type-check
npm run build
```
