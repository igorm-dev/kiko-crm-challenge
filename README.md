# kiko-crm-challenge

Projeto de desafio técnico: um CRM de vendas B2B (leads, negócios, pipeline Kanban) desenvolvido para a operação de equipamentos fitness da Kiko.

## Stack

| Camada    | Escolha                                                       |
| --------- | ------------------------------------------------------------- |
| Monorepo  | pnpm workspaces                                               |
| Backend   | NestJS 10 + TypeORM + PostgreSQL 16                           |
| Frontend  | React 18 + Vite + React Router + TanStack Query               |
| Estilo    | Tailwind CSS 4 (configurado em CSS, sem `tailwind.config.js`) |
| Contratos | Zod, compartilhado entre backend e frontend                   |

## Estrutura

```
apps/
  api/          NestJS — REST em /api
  web/          React SPA (Vite), proxy de /api para a API em dev
packages/
  contracts/    schemas Zod + tipos derivados (fonte única do contrato)
  tsconfig/     tsconfigs base compartilhados (base / node / react)
```

`apps/` são coisas que rodam e fazem deploy. `packages/` são coisas consumidas.

> **Estado atual:** apenas a infraestrutura do projeto. Ainda não há entidades de
> domínio nem telas — elas serão adicionadas uma a uma. O que existe hoje é o
> monorepo configurado, a API conectando no banco e uma tela inicial de status.

## Por que um monorepo aqui

`packages/contracts` define cada entidade uma única vez em Zod. O NestJS valida
requests com o schema (`ZodValidationPipe`); o React deriva os tipos com `z.infer` e
valida as respostas com o mesmo schema. Mudou o contrato, o build do frontend quebra —
em vez de falhar em runtime.

Hoje o único contrato é o `HealthSchema`, que existe justamente para provar essa
integração de ponta a ponta antes da primeira entidade real.

## Pré-requisitos

| Ferramenta | Versão | Observação                                          |
| ---------- | ------ | --------------------------------------------------- |
| Node.js    | >= 22  | versão fixada em `.nvmrc` (24)                      |
| pnpm       | >= 9   | veja abaixo                                         |
| Docker     | >= 24  | com Docker Compose v2 (`docker compose`, sem hífen) |

Instale o pnpm globalmente:

```bash
npm install -g pnpm
```

As versões mínimas estão em `engines` no `package.json` raiz e são verificadas de
fato — com `engine-strict` ligado no `.npmrc`, um pnpm ou Node abaixo do mínimo faz o
`pnpm install` falhar com mensagem explícita, em vez de quebrar mais adiante.

Não é preciso ter PostgreSQL instalado — ele sobe via Docker.

## Rodando

### 1. Instalar dependências

```bash
pnpm install
```

Instala todos os pacotes do workspace de uma vez e faz o link de `@kiko/contracts`
dentro de `apps/api` e `apps/web`.

### 2. Configurar variáveis de ambiente

```bash
# bash / Git Bash
cp apps/api/.env.example apps/api/.env

# PowerShell
Copy-Item apps/api/.env.example apps/api/.env
```

Os valores padrão já apontam para o Postgres do Docker — não precisa editar nada
para rodar localmente. As variáveis são validadas com Zod no boot da API
(`apps/api/src/config/env.ts`), então um valor faltando falha imediatamente com
mensagem clara, em vez de quebrar na primeira query.

| Variável       | Padrão                                         | Descrição               |
| -------------- | ---------------------------------------------- | ----------------------- |
| `NODE_ENV`     | `development`                                  | ambiente de execução    |
| `PORT`         | `3000`                                         | porta da API            |
| `DATABASE_URL` | `postgres://kiko:kiko@localhost:5433/kiko_crm` | conexão do Postgres     |
| `CORS_ORIGIN`  | `http://localhost:5173`                        | origem liberada no CORS |

### 3. Subir o banco

```bash
pnpm db:up
```

Confirme que o container está saudável antes de seguir:

```bash
docker compose ps      # espere STATUS = Up (healthy)
```

O `healthcheck` roda `pg_isready`, então "healthy" significa que o Postgres está de
fato aceitando conexão — não apenas que o container existe.

### 4. Aplicar as migrations

```bash
pnpm migration:run
```

Como ainda não existem entidades, não há migrations a aplicar — este passo não faz
nada por enquanto. Ele já está no lugar para quando a primeira entidade chegar.

> `synchronize` está desligado de propósito: as migrations são a fonte de verdade do
> schema, e o TypeORM nunca altera o banco sozinho. Ao adicionar uma entidade,
> registre-a em `apps/api/src/database/data-source.ts` e gere a migration:
>
> ```bash
> pnpm migration:generate apps/api/src/database/migrations/NomeDaMigration
> ```

### 5. Rodar em desenvolvimento

```bash
pnpm dev
```

Sobe três processos em paralelo: `contracts` em watch (`tsup --watch`), a API
(`nest start --watch`) e o frontend (`vite`). Alterar um schema em `contracts`
recompila e propaga para os dois apps sem restart manual.

| Serviço  | URL                       |
| -------- | ------------------------- |
| Web      | http://localhost:5173     |
| API      | http://localhost:3000/api |
| Postgres | `localhost:5433`          |

O Vite faz proxy de `/api` para `http://localhost:3000`, então o browser fica em uma
única origem em dev e o CORS não interfere.

### Verificando que está tudo certo

```bash
pnpm typecheck    # tsc --noEmit nos 3 pacotes
pnpm build        # build em ordem topológica
pnpm test         # testes
```

## Problemas comuns

**Porta 5433 já em uso.** Crie um `.env` na raiz do repositório com
`POSTGRES_PORT=5434` e ajuste a porta na `DATABASE_URL` de `apps/api/.env`.
O container continua usando 5432 internamente — só o mapeamento no host muda.

**`Invalid environment configuration` ao subir a API.** Faltou o passo 2, ou alguma
variável está inválida. A mensagem lista exatamente qual campo e por quê.

**API não conecta no banco.** Rode `docker compose ps` e confirme `Up (healthy)`.
Se estiver `starting`, aguarde alguns segundos — o Postgres leva um instante para
aceitar conexões na primeira subida.

**Erro de tipo em `@kiko/contracts` no editor.** O pacote precisa ter sido compilado
ao menos uma vez: `pnpm --filter @kiko/contracts build`. O `pnpm dev` mantém isso em
watch, mas em um clone novo o primeiro build ainda não aconteceu.

**Resetar o banco do zero.** `docker compose down -v` apaga o volume; depois
`pnpm db:up` e `pnpm migration:run`.

## Scripts (raiz)

| Script                           | O que faz                                      |
| -------------------------------- | ---------------------------------------------- |
| `pnpm dev`                       | roda todos os pacotes em paralelo              |
| `pnpm build`                     | build em ordem topológica (contracts primeiro) |
| `pnpm typecheck`                 | `tsc --noEmit` em todos                        |
| `pnpm test`                      | testes de todos                                |
| `pnpm format`                    | Prettier em tudo                               |
| `pnpm db:up` / `db:down`         | Postgres via Docker                            |
| `pnpm migration:generate <path>` | gera migration a partir das entities           |
| `pnpm migration:run`             | aplica migrations pendentes                    |

Filtrar um pacote só: `pnpm --filter @kiko/api <script>`.
Rodar apenas o que mudou vs. `main`: `pnpm --filter '...[origin/main]' test`.

## API

| Método | Rota          | Descrição                              |
| ------ | ------------- | -------------------------------------- |
| `GET`  | `/api/health` | status da API e da conexão com o banco |

Os endpoints de domínio serão adicionados conforme cada entidade for implementada.
