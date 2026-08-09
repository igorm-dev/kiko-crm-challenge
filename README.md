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

> **Estado atual:** autenticação e autorização completas; leads com listagem
> paginada, criação, edição e arquivamento; vendedores com listagem, criação,
> edição, habilitar/desabilitar e senha gerada pelo sistema; e
> negócios com pipeline Kanban (arrastar entre colunas, painel de detalhes e
> comentários) na tela **Board**. A aba Negócios traz a listagem completa e a página de detalhes de cada negócio.

## Por que um monorepo aqui

`packages/contracts` define cada entidade uma única vez em Zod. O NestJS valida
requests com o schema (`ZodValidationPipe`); o React deriva os tipos com `z.infer` e
valida as respostas com o mesmo schema. Mudou o contrato, o build do frontend quebra —
em vez de falhar em runtime.

Isso vale para todo o domínio — `user`, `lead`, `deal`, `comment`, `auth`, além dos
utilitários `enums`, `pagination` e `permissions`. Um endpoint passa pelo mesmo schema
quatro vezes: o `ZodValidationPipe` valida o corpo da request, o controller passa a
resposta por `.parse()` antes de devolvê-la, o `apiFetch` do frontend valida o que
chegou, e o formulário reaproveita o schema de criação para validar em tela.

O caso mais forte é `permissions.ts`. As funções `canManage`, `canAssignTo` e
`resolveOwnerId` são puras e sem dependência de framework, então **as mesmas funções**
decidem o `403` no NestJS (via `shared/ownership.ts`) e escondem o botão no React (via
`usePermissions`). A regra de autorização existe uma vez só — a interface não tem como
discordar da API.

Dois efeitos colaterais úteis do `.parse()` na fronteira: o Zod descarta silenciosamente
qualquer campo não declarado no schema, o que impede a API de vazar coluna sensível por
acidente; e `z.coerce.date()` entrega `Date` de verdade no frontend, sem `new Date()`
espalhado pelas telas.

## Pré-requisitos

| Ferramenta | Versão | Observação                                          |
| ---------- | ------ | --------------------------------------------------- |
| Node.js    | >= 22  | versão fixada em `.nvmrc` (24)                      |
| pnpm       | >= 11  | veja abaixo                                         |
| Docker     | >= 24  | com Docker Compose v2 (`docker compose`, sem hífen) |

A versão exata do pnpm está fixada em `packageManager` no `package.json` raiz. A forma
recomendada de obtê-la é via Corepack, que já vem com o Node e baixa exatamente essa
versão:

```bash
corepack enable
```

Alternativamente, `npm install -g pnpm@11`.

As versões mínimas estão em `engines` no `package.json` raiz e são verificadas de
fato — com `engine-strict` ligado no `.npmrc`, um pnpm ou Node abaixo do mínimo faz o
`pnpm install` falhar com mensagem explícita, em vez de quebrar mais adiante.

### Scripts de instalação (`allowBuilds`)

A partir do pnpm 10, scripts de `postinstall` de dependências não rodam por padrão
(proteção contra supply-chain), e no pnpm 11 um script ignorado sem decisão registrada
faz o `install` falhar com `ERR_PNPM_IGNORED_BUILDS`. Por isso o `pnpm-workspace.yaml`
declara `allowBuilds` explicitamente:

- `esbuild` — o postinstall resolve o binário nativo da plataforma; sem ele o build do
  `apps/web` não funciona.
- `@nestjs/core` — postinstall inofensivo (só imprime o aviso do Open Collective),
  liberado para não deixar o install em estado pendente.

Ao adicionar uma dependência que peça build, o pnpm avisa; registre a decisão nesse
mesmo bloco em vez de suprimir o aviso.

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
(`apps/api/src/infra/config/env.ts`), então um valor faltando falha imediatamente com
mensagem clara, em vez de quebrar na primeira query.

| Variável         | Padrão                                         | Descrição                    |
| ---------------- | ---------------------------------------------- | ---------------------------- |
| `NODE_ENV`       | `development`                                  | ambiente de execução         |
| `PORT`           | `3000`                                         | porta da API                 |
| `DATABASE_URL`   | `postgres://kiko:kiko@localhost:5433/kiko_crm` | conexão do Postgres          |
| `CORS_ORIGIN`    | `http://localhost:5173`                        | origem liberada no CORS      |
| `JWT_SECRET`     | — (obrigatório, ≥ 32 chars)                    | chave de assinatura do token |
| `JWT_EXPIRES_IN` | `8h`                                           | validade do access token     |

`JWT_SECRET` é a única sem padrão **no schema**, de propósito: um segredo com valor de
fallback embutido no código é um segredo que todo mundo conhece. O `.env.example` traz
um valor descartável só para o projeto subir de primeira na avaliação — em qualquer uso
real, gere o seu:

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
> registre-a em `apps/api/src/infra/database/data-source.ts` e gere a migration:
>
> ```bash
> pnpm migration:generate src/infra/database/migrations/NomeDaMigration
> ```
>
> O caminho é relativo a `apps/api`, porque o script roda com
> `pnpm --filter @kiko/api` e o TypeORM resolve a partir do diretório do pacote.

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

Antes de tudo o script faz um build único de `contracts` e só então sobe três processos
em paralelo: `contracts` em watch (`tsup --watch`), a API (`nest start --watch`) e o
frontend (`vite`). Alterar um schema em `contracts` recompila e propaga para os dois
apps sem restart manual.

O build inicial não é redundante: sem ele os três processos partem juntos e o
`tsc --watch` do Nest tenta resolver `@kiko/contracts` antes de o `tsup` ter emitido os
`.d.ts`, falhando com `Cannot find module '@kiko/contracts'`. Pelo mesmo motivo o
`tsup.config.ts` usa `clean: !options.watch` — limpar o `dist/` a cada rebuild em watch
reabriria essa janela sem tipos a cada edição.

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
pnpm format:check # Prettier sem escrever nada
```

Pare o `pnpm dev` antes de rodar o `pnpm build`: o `nest build` apaga `apps/api/dist`
debaixo do `nest start --watch` e derruba a API.

A suíte automatizada ainda não existe — o Jest está configurado no `apps/api` e
`pnpm test` passa com `--passWithNoTests`. É a próxima dívida da lista; os alvos
naturais são as regras puras, que concentram o risco e não precisam de banco:
`permissions.ts`, a geração do código sequencial dos negócios e o `AuthService.login`
(resposta uniforme e tempo constante para e-mail inexistente).

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
| `pnpm test`                      | testes de todos (hoje, suíte vazia)            |
| `pnpm format` / `format:check`   | Prettier em tudo, escrevendo ou só conferindo  |
| `pnpm db:up` / `db:down`         | Postgres via Docker                            |
| `pnpm migration:generate <path>` | gera migration a partir das entities           |
| `pnpm migration:run`             | aplica migrations pendentes                    |
| `pnpm db:seed`                   | cria os usuários iniciais (idempotente)        |

Filtrar um pacote só: `pnpm --filter @kiko/api <script>`.
Rodar apenas o que mudou vs. `main`: `pnpm --filter '...[origin/main]' test`.

## API

Todas as rotas ficam sob o prefixo `/api`. Salvo indicação em contrário, exigem
`Authorization: Bearer <token>`.

### Saúde e sessão

| Método | Rota          | Acesso      | Descrição                              |
| ------ | ------------- | ----------- | -------------------------------------- |
| `GET`  | `/health`     | público     | status da API e da conexão com o banco |
| `POST` | `/auth/login` | público     | devolve `{ accessToken, user }`        |
| `GET`  | `/auth/me`    | autenticado | usuário do token, relido do banco      |

### Usuários

| Método   | Rota                        | Acesso      | Descrição                                        |
| -------- | --------------------------- | ----------- | ------------------------------------------------ |
| `GET`    | `/users`                    | autenticado | lista paginada (usada para atribuir responsável) |
| `GET`    | `/users/:id`                | autenticado | detalhe de um usuário                            |
| `POST`   | `/users`                    | **admin**   | cadastra e devolve `{ user, generatedPassword }` |
| `PATCH`  | `/users/:id`                | **admin**   | atualiza nome, e-mail, papel ou cargo            |
| `POST`   | `/users/:id/reset-password` | **admin**   | gera uma nova senha e a devolve uma única vez    |
| `POST`   | `/users/:id/disable`        | **admin**   | bloqueia o acesso sem apagar o histórico         |
| `POST`   | `/users/:id/enable`         | **admin**   | reabilita o acesso                               |
| `DELETE` | `/users/:id`                | **admin**   | soft delete                                      |

A senha nunca é enviada pelo cliente: ela é gerada pelo servidor e aparece **uma única
vez** na resposta de `POST /users` e de `reset-password`. Por isso `PATCH /users/:id`
não altera senha. Um administrador também não consegue desabilitar nem excluir o
próprio usuário — é o que evita o CRM ficar sem administrador.

### Leads

| Método  | Rota                   | Acesso      | Descrição                      |
| ------- | ---------------------- | ----------- | ------------------------------ |
| `GET`   | `/leads`               | autenticado | lista paginada, busca e filtro |
| `POST`  | `/leads`               | autenticado | cadastra um lead               |
| `GET`   | `/leads/:id`           | autenticado | detalhe de um lead             |
| `PATCH` | `/leads/:id`           | autenticado | atualiza um lead (parcial)     |
| `POST`  | `/leads/:id/archive`   | autenticado | arquiva um lead                |
| `POST`  | `/leads/:id/unarchive` | autenticado | desarquiva um lead             |

### Negócios e comentários

| Método  | Rota                  | Acesso      | Descrição                                            |
| ------- | --------------------- | ----------- | ---------------------------------------------------- |
| `GET`   | `/deals`              | autenticado | lista paginada, busca e filtro                       |
| `GET`   | `/deals/board`        | autenticado | pipeline agrupado por situação, pronto para o Kanban |
| `GET`   | `/deals/:id`          | autenticado | detalhe de um negócio                                |
| `POST`  | `/deals`              | autenticado | cadastra um negócio e atribui o código sequencial    |
| `PATCH` | `/deals/:id`          | autenticado | atualiza um negócio (parcial)                        |
| `POST`  | `/deals/:id/move`     | autenticado | muda a situação e registra o evento na timeline      |
| `GET`   | `/deals/:id/comments` | autenticado | comentários e eventos, mais recentes primeiro        |
| `POST`  | `/deals/:id/comments` | autenticado | escreve um comentário                                |

Comentário não é recurso de topo: só existe pendurado em um negócio, então as rotas
vivem sob `/deals/:id`.

### Paginação e filtros

Toda listagem responde `{ items, total, page, pageSize, pageCount }` e aceita `page`
(padrão `1`) e `pageSize` (padrão `10`, máximo `100`). Os demais parâmetros:

| Rota     | Parâmetros adicionais                                                                      |
| -------- | ------------------------------------------------------------------------------------------ |
| `/users` | `search` (nome ou e-mail), `role` (`admin`/`seller`), `view` (`active`\*/`disabled`/`all`) |
| `/leads` | `search` (nome, empresa ou e-mail), `sellerId`, `view` (`active`\*/`archived`/`all`)       |
| `/deals` | `search` (nome, código ou nome do lead), `status`, `sellerId`                              |

\* padrão quando o parâmetro é omitido. Ou seja, `GET /leads` sem `view` devolve apenas
os leads ativos — arquivados só aparecem sob pedido explícito.

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

### Papéis e posse dos registros

Só existem dois papéis, e a diferença entre eles cabe em três funções puras em
`packages/contracts/src/permissions.ts`:

| Ação                                     | Vendedor                    | Administrador    |
| ---------------------------------------- | --------------------------- | ---------------- |
| Ver leads, negócios e vendedores         | tudo                        | tudo             |
| Criar lead ou negócio                    | sempre atribuído a si mesmo | a quem quiser    |
| Editar, arquivar ou mover                | só os seus                  | qualquer um      |
| Comentar                                 | qualquer negócio            | qualquer negócio |
| Cadastrar, editar ou desabilitar usuário | não                         | sim              |

Um vendedor que tenta criar um lead no nome de outra pessoa não recebe `403`: o
`sellerId` enviado é simplesmente **ignorado** e substituído pelo próprio
(`resolveOwnerId`). Assim não existe registro órfão nem trabalho plantado na carteira
do colega, e o cliente não precisa acertar o campo para ter sucesso.

Já editar coisa alheia é `403` explícito — aí a intenção é inequívoca e silenciar seria
pior. A interface aplica a mesma regra antes: sem permissão, a alça de arrastar do card
e o botão de arquivar nem são renderizados. Isso é conforto, não segurança — quem
contornar a interface esbarra no mesmo `canManage` do lado do servidor.

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

Cria dois usuários, um de cada papel, para dar para experimentar as duas visões do
sistema:

| E-mail                       | Senha        | Papel         | Cargo               |
| ---------------------------- | ------------ | ------------- | ------------------- |
| `rodrigo.ramos@kikos.com.br` | `Senha1234;` | Administrador | Head de Vendas      |
| `marina.costa@kikos.com.br`  | `Senha1234;` | Vendedor      | Executiva de Contas |

Entre com os dois para ver a diferença: o administrador enxerga a aba de cadastro de
vendedores e consegue mover qualquer card do Kanban; a vendedora só mexe no que é dela.

A lista vive em `apps/api/src/infra/database/seeds/data/users.seed.ts` — nome, e-mail,
senha e papel, tudo num arquivo só. É idempotente: rodar de novo ignora quem já existe
e nunca sobrescreve uma senha trocada. Não há cadastro público — num CRM corporativo,
quem cria conta é o administrador, via `POST /api/users`.
