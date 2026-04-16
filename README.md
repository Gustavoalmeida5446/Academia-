# Academia-

Aplicativo de treino com `React + Vite + Tailwind CSS + Supabase`, pensado para acompanhar treinos, cargas, peso corporal e histórico por data com fallback local no navegador.

## Stack

- React
- Vite
- Tailwind CSS
- Supabase Auth + banco
- localStorage como fallback offline
- compatível com deploy em GitHub Pages

## Funcionalidades

- cadastro, login e logout com Supabase
- fallback local quando o usuário não está logado
- sincronização manual com Supabase
- salvar peso corporal por data
- marcar exercício como feito
- salvar peso usado por exercício
- histórico por treino e data
- importar e exportar backup em JSON
- criar, renomear e excluir treinos
- adicionar, editar, excluir e reordenar exercícios
- autocomplete híbrido com:
  - exercícios do próprio usuário
  - base local do projeto
  - API pública opcional

## Estrutura

```text
src/
  components/
  data/
  hooks/
  lib/
  services/
  utils/
  App.jsx
  main.jsx
  index.css
```

## Instalação

```bash
npm install
```

## Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

Use a `Project URL` e a `anon public key` do Supabase.

Também confirme no painel do Supabase:

- `Authentication > Providers > Email`

## Rodando localmente

```bash
npm run dev
```

## Build de produção

```bash
npm run build
```

## Preview local da build

```bash
npm run preview
```

## Deploy no GitHub Pages

Este projeto já está configurado com `base: "./"` no Vite para facilitar publicação estática.

Passos:

1. Gere a build:

```bash
npm run build
```

2. Publique:

```bash
npm run deploy
```

Isso envia a pasta `dist` para a branch de publicação do GitHub Pages.

No repositório do GitHub, confirme a configuração em:

- `Settings > Pages`

Se necessário, selecione a branch usada pelo `gh-pages`.

## SQL do Supabase

Execute o SQL de `supabase/schema_v2.sql` no Supabase SQL Editor.

Esse schema novo usa duas tabelas:

- `app_state`: guarda o estado essencial completo do app (treinos, exercicios, historico, peso, dieta e parametros)
- `daily_logs`: guarda apenas os logs diarios da home (`workout_done` e `diet_done`)

Assim os logs ficam simples e o app segue sincronizando tudo com fallback local.

## Fluxo de dados

- sem login: os dados ficam no `localStorage`
- com login: o app continua salvando localmente e permite sincronizar com Supabase
- ao entrar: o app tenta carregar os dados do usuário
- ao concluir treino: o histórico é salvo por data

## Observações

- a definição editável dos treinos está salva localmente e no backup JSON
- o schema atual do Supabase está focado em logs por exercício/data, não em modelar toda a estrutura dos treinos
- a parte de API do autocomplete é opcional: se falhar, o app continua funcionando com base local e dados customizados

## Checklist rápido

1. Instalar dependências com `npm install`
2. Configurar `.env`
3. Rodar `npm run dev`
4. Testar cadastro e login
5. Testar salvar peso corporal
6. Testar checks e pesos por exercício
7. Testar criação e edição de treinos
8. Testar autocomplete
9. Testar histórico
10. Testar import/export
11. Testar `npm run build`
