# kiko-crm-challenge

Projeto de desafio técnico: um CRM de vendas B2B (leads, negócios, pipeline Kanban) desenvolvido para a operação de equipamentos fitness da Kiko.

## Stack

| Camada    | Escolha                                         |
| --------- | ----------------------------------------------- |
| Monorepo  | pnpm workspaces                                 |
| Backend   | NestJS 10 + TypeORM + PostgreSQL 16             |
| Frontend  | React 18 + Vite + React Router + TanStack Query |
| Estilo    | Tailwind CSS 4 + shadcn/ui (Radix)              |
| Contratos | Zod, compartilhado entre backend e frontend     |

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

> **Estado atual:** autenticação e autorização completas, e o CRUD de leads
> (listagem paginada e criação) funcionando de ponta a ponta. Dashboard,
> negócios e vendedores existem como páginas vazias.

## Por que um monorepo aqui

`packages/contracts` define cada entidade uma única vez em Zod. O NestJS valida
requests com o schema (`ZodValidationPipe`); o React deriva os tipos com `z.infer` e
valida as respostas com o mesmo schema. Mudou o contrato, o build do frontend quebra —
em vez de falhar em runtime.

Hoje isso já vale para `UserSchema`, `LoginSchema` e `LoginResponseSchema`: o
mesmo arquivo valida o corpo do `POST /auth/login` no Nest e a resposta no React.

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

| Variável         | Padrão                                         | Descrição                    |
| ---------------- | ---------------------------------------------- | ---------------------------- |
| `NODE_ENV`       | `development`                                  | ambiente de execução         |
| `PORT`           | `3000`                                         | porta da API                 |
| `DATABASE_URL`   | `postgres://kiko:kiko@localhost:5433/kiko_crm` | conexão do Postgres          |
| `CORS_ORIGIN`    | `http://localhost:5173`                        | origem liberada no CORS      |
| `JWT_SECRET`     | — (obrigatório, ≥ 32 chars)                    | chave de assinatura do token |
| `JWT_EXPIRES_IN` | `8h`                                           | validade do access token     |

`JWT_SECRET` é a única sem padrão, de propósito: um segredo com valor de
fallback é um segredo que todo mundo conhece. Gere o seu:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

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

Cria as tabelas de `users`, `leads`, `deals` e `comments`.

> `synchronize` está desligado de propósito: as migrations são a fonte de verdade do
> schema, e o TypeORM nunca altera o banco sozinho. Ao adicionar uma entidade,
> registre-a em `apps/api/src/database/data-source.ts` e gere a migration:
>
> ```bash
> pnpm migration:generate apps/api/src/database/migrations/NomeDaMigration
> ```

### 5. Criar os usuários iniciais

```bash
pnpm db:seed
```

Sem isso não há como logar — não existe cadastro público. Detalhes em
[Autenticação e autorização](#autenticação-e-autorização).

### 6. Rodar em desenvolvimento

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
`pnpm db:up`, `pnpm migration:run` e `pnpm db:seed`.

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
| `pnpm db:seed`                   | cria os usuários iniciais (idempotente)        |

Filtrar um pacote só: `pnpm --filter @kiko/api <script>`.
Rodar apenas o que mudou vs. `main`: `pnpm --filter '...[origin/main]' test`.

## API

| Método   | Rota                       | Acesso      | Descrição                              |
| -------- | -------------------------- | ----------- | -------------------------------------- |
| `GET`    | `/api/health`              | público     | status da API e da conexão com o banco |
| `POST`   | `/api/auth/login`          | público     | devolve `{ accessToken, user }`        |
| `GET`    | `/api/auth/me`             | autenticado | usuário do token, relido do banco      |
| `GET`    | `/api/users`               | autenticado | lista usuários (para atribuir leads)   |
| `GET`    | `/api/users/:id`           | autenticado | detalhe de um usuário                  |
| `POST`   | `/api/users`               | **admin**   | cadastra um usuário                    |
| `PATCH`  | `/api/users/:id`           | **admin**   | atualiza dados ou senha                |
| `DELETE` | `/api/users/:id`           | **admin**   | soft delete                            |
| `GET`    | `/api/leads`               | autenticado | lista paginada, com busca e filtro     |
| `POST`   | `/api/leads`               | autenticado | cadastra um lead                       |
| `GET`    | `/api/leads/:id`           | autenticado | detalhe de um lead                     |
| `PATCH`  | `/api/leads/:id`           | autenticado | atualiza um lead (parcial)             |
| `POST`   | `/api/leads/:id/archive`   | autenticado | arquiva um lead                        |
| `POST`   | `/api/leads/:id/unarchive` | autenticado | desarquiva um lead                     |

`GET /api/leads` aceita `page`, `pageSize` (máx. 100), `search` (nome, empresa ou
e-mail) e `sellerId`, e responde
`{ items, total, page, pageSize, pageCount }`. Os endpoints de negócios e
comentários serão adicionados conforme cada entidade for implementada.

## Autenticação e autorização

JWT assinado com HS256, enviado em `Authorization: Bearer <token>`. Só access
token, com validade de 8h (`JWT_EXPIRES_IN`) — a jornada de trabalho de um
vendedor. Sem refresh token: para um CRM interno, o custo de rotação e
revogação não se paga.

**Autenticar é o padrão.** O `JwtAuthGuard` é registrado como `APP_GUARD`, então
toda rota nasce protegida e só é aberta com `@Public()`. Esquecer o decorator
tranca a rota; o contrário exporia dados sem ninguém perceber.

**Autorizar é a exceção.** O `RolesGuard` roda depois e só age em rotas com
`@Roles(UserRole.Admin)`. Sem o decorator, qualquer usuário autenticado passa —
autorização estreita a autenticação, não a substitui.

Senhas são hasheadas com bcrypt (cost 12) e a coluna `password_hash` é
`select: false` na entidade: nenhuma consulta a traz por acidente. O único
caminho que a carrega é o login. As respostas ainda passam pelo `UserSchema`
antes de sair, que descarta qualquer campo não declarado — duas barreiras
independentes para o mesmo vazamento.

Login errado sempre responde `401 E-mail ou senha incorretos.`, seja o e-mail
inexistente ou a senha errada. Quando o e-mail não existe, o serviço compara
contra um hash descartável em vez de retornar de imediato: sem isso, a diferença
de tempo entregaria quais e-mails têm conta.

### No frontend

O token vai para o `localStorage` (`lib/auth-storage.ts`) e o
`services/api.ts` o injeta em toda requisição — nenhum componente manipula
token diretamente.

**`/auth/me` é a fonte da verdade da sessão.** Um token guardado só prova que
houve login em algum momento; a cada boot o app pergunta à API se ele ainda
vale, e recebe o usuário como o banco o tem agora. Ler o JWT no cliente para
extrair o usuário seria mais rápido e estaria errado na primeira vez que alguém
mudasse de cargo ou de role.

Por isso a sessão tem **três** estados, não dois: autenticado, não autenticado
e _carregando_. Tratar "ainda não sei" como "não autenticado" mandaria o usuário
para o login a cada F5.

Quando a API responde 401 com um token em mãos, o `services/api.ts` descarta o
token e emite o evento `kiko:unauthorized`. Ele não navega porque não conhece o
router — quem escuta é o `AuthProvider`, que encerra a sessão. É o que cobre o
token expirando no meio do expediente.

### Usuários iniciais

```bash
pnpm db:seed
```

Cria os usuários listados em `apps/api/src/infra/database/seeds/data/users.seed.ts`
— nome, e-mail, senha e papel, tudo num arquivo só. É idempotente — rodar de novo
ignora quem já existe e nunca sobrescreve uma senha trocada. Não há cadastro
público: num CRM corporativo, quem cria conta é o administrador, via
`POST /api/users`.
