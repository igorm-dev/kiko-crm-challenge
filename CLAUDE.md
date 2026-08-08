# CLAUDE.md

Orientações para o Claude Code trabalhar neste repositório.

## Comentários

**Não escreva comentários em código.** Nada de `//`, `/* */` ou JSDoc.

O código deve se explicar por nomes e estrutura. Se um trecho precisa de
comentário para ser entendido, o problema é o trecho — extraia uma função com
nome descritivo, renomeie a variável, ou simplifique a lógica.

Isso vale para código novo e para código que você editar. Não reintroduza
comentários que foram removidos.

Exceções, e só estas:

- Diretivas funcionais que o tooling lê: `// prettier-ignore`,
  `// eslint-disable-next-line`, `// @ts-expect-error`.
- Arquivos de configuração não-código: `.env.example`, `docker-compose.yml`.
- Documentação em Markdown: README, este arquivo.

Se algo realmente precisa ser explicado — uma armadilha de biblioteca, uma
decisão de segurança, um "por que não do jeito óbvio" — escreva no README, na
seção correspondente. Documentação vive em Markdown, não espalhada pelo código.

## Estilo

- Prettier decide a formatação (`pnpm format`). Não formate à mão.
- Português nas mensagens ao usuário final e no Markdown; inglês em
  identificadores de código.
- Schemas Zod ficam em `packages/contracts` quando são contrato de API,
  compartilhados entre `apps/api` e `apps/web`.

## Verificação

Antes de dizer que algo está pronto:

```bash
pnpm typecheck
pnpm build
```

Não rode `pnpm build` com o `pnpm dev` ativo: `nest build` apaga `apps/api/dist`
debaixo do `nest start --watch` e derruba a API.
