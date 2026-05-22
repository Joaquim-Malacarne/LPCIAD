# LPCIAD — Plataforma de Divulgação Científica

**Laboratório de Projetos de Circuitos Integrados Analógicos e Digitais**
Universidade Católica de Santos — UniSantos

![Angular](https://img.shields.io/badge/Angular-20-dd0031?style=flat-square&logo=angular)
![.NET](https://img.shields.io/badge/.NET-8.0-512bd4?style=flat-square&logo=dotnet)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![WCAG](https://img.shields.io/badge/WCAG-2.2-005a9c?style=flat-square)

---

## Sobre o Projeto

Este repositório contém a plataforma web oficial do **LPCIAD**, desenvolvida para centralizar e divulgar as publicações, projetos, pesquisas e atividades do laboratório para a comunidade acadêmica e o público em geral.

A aplicação permite que membros do laboratório publiquem conteúdo em **português e inglês** por meio de um painel administrativo com editor Markdown, enquanto visitantes navegam por um catálogo visual de publicações organizadas por categorias.

O desenvolvimento atual tem foco em **melhorias de Interação Humano-Computador (IHC)** e **acessibilidade WCAG 2.2**, aplicando as heurísticas de Nielsen e os critérios de sucesso da WCAG como parte de um trabalho acadêmico da disciplina de IHC — tendo como referência principal Barbosa & Silva (2010) e Rubin & Chisnell (2008).

---

## Funcionalidades

### Para visitantes
- **Carrossel de destaques** — exibe as publicações mais recentes com imagem em destaque, com navegação por teclado e pausa automática no hover/foco (WCAG 2.2.2)
- **Feed de publicações** — listagem com filtro por categorias (Pesquisa, Projetos, Atividades, Cursos & Eventos) e busca por texto
- **Leitura de posts** — conteúdo renderizado a partir de Markdown com suporte a imagens
- **Interface bilíngue** — Português e Inglês, alternáveis em tempo real sem recarregar a página
- **Skip-link de acessibilidade** — atalho de teclado para pular o menu de navegação diretamente ao conteúdo (WCAG 2.4.1)

### Para administradores
- **Autenticação segura** — login com JWT + BCrypt, sem exposição de senhas em texto plano
- **Dashboard de posts** — tabela com status, data de criação, data de última modificação e ações rápidas
- **Modal de confirmação** — previne alterações acidentais de status (Nielsen #3: Prevenção de erros)
- **Toast "Desfazer"** — reverte a última alteração de status em até 5 segundos, sem recarregar a página (Nielsen #2: Controle e liberdade)
- **Editor Markdown bilíngue** — abas PT/EN com preview em tempo real, suporte a imagens por colagem (Ctrl+V) e drag-and-drop
- **Upload de imagens** — vinculadas ao post e servidas diretamente pela API, com substituição automática de blob URLs
- **Gerenciamento de categorias** — tags com cores associadas para facilitar classificação do conteúdo

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | Angular (standalone components, SSR, strict mode) | 20 |
| Carrossel | Swiper | 12 |
| Renderização Markdown | marked + DomSanitizer | 17 |
| Estilos | CSS puro (sem preprocessadores ou variáveis globais) | — |
| Backend | ASP.NET Core Web API | .NET 8 |
| Autenticação | JWT Bearer + BCrypt.Net-Next | — |
| Documentação da API | Swagger / OpenAPI (Swashbuckle) | — |
| Persistência | Arquivos Markdown + JSON | sem banco de dados |

> **Por que sem banco de dados?** Cada post é um diretório com `pt.md`, `en.md` (opcional) e `metadata.json`. Isso simplifica o deploy e a manutenção em um ambiente universitário sem infraestrutura de BD dedicada.

---

## Arquitetura

```
LPCIAD/
├── backend/
│   └── LPCIAD.WebApi/
│       ├── Controllers/        # AuthController, PostsController
│       ├── Dtos/               # Contratos de request/response (PostListItemResponse, etc.)
│       ├── Services/           # Lógica de negócio (leitura/escrita de arquivos Markdown)
│       └── Posts/              # Dados em runtime — ignorados pelo git
│
└── frontend/
    └── LPCIAD_Web/src/app/
        ├── admin/
        │   ├── add-post/           # Editor Markdown bilingue (criação e edição via :id)
        │   └── posts-dashboard/    # Gerenciamento: listagem, toggle, undo
        ├── gallery/                # Carrossel Swiper com posts recentes
        ├── feed/                   # Listagem com filtros e busca
        ├── post-detail/            # Leitura de post individual
        ├── models/                 # Interfaces TypeScript (PostListItem, PostDetailItem...)
        ├── services/               # PostService, LanguageService
        ├── pipes/                  # TranslatePipe (i18n customizado)
        ├── guards/                 # authGuard (proteção de rotas admin)
        └── assets/i18n/            # pt.json, en.json
```

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| .NET SDK | 8.0 |
| Angular CLI | 18+ (`npm i -g @angular/cli`) |

---

## Como Executar Localmente

### 1. Backend

```bash
cd backend/LPCIAD.WebApi
```

Crie o arquivo `appsettings.Development.json` (não versionado — veja `.gitignore`) com:

```json
{
  "JWT": {
    "Secret": "sua-chave-secreta-com-pelo-menos-32-caracteres",
    "ExpirationHours": 8
  },
  "Auth": {
    "Users": [
      {
        "Username": "admin",
        "PasswordHash": "$2a$11$SEU_HASH_BCRYPT_AQUI"
      }
    ]
  }
}
```

> Para gerar o hash BCrypt da senha, use `BCrypt.Net.BCrypt.HashPassword("sua-senha")` em qualquer script .NET, ou um gerador online confiável.

```bash
dotnet run
```

API disponível em `http://localhost:5000` · Swagger em `http://localhost:5000/swagger`

---

### 2. Frontend

```bash
cd frontend/LPCIAD_Web
npm install
ng serve
```

Aplicação disponível em `http://localhost:4200`

---

## Endpoints da API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | — | Autentica e retorna JWT |
| `POST` | `/auth/refresh` | Sim | Renova o token JWT |
| `GET` | `/Posts` | — | Lista todos os posts (dados resumidos) |
| `GET` | `/Posts/{id}/Language/{lang}` | — | Detalhe de um post (`pt` ou `en`) |
| `POST` | `/Posts` | Sim | Cria um novo post (`multipart/form-data`) |
| `PUT` | `/Posts/{id}` | Sim | Atualiza um post existente |
| `PATCH` | `/Posts/{id}/ToggleActive` | Sim | Ativa ou desativa um post |
| `DELETE` | `/Posts/{id}` | Sim | Desativa o post (soft delete via `isActive = false`) |
| `GET` | `/Posts/{id}/Image/{imageName}` | — | Retorna imagem vinculada ao post |

**Payload multipart (POST e PUT):**

| Campo | Tipo | Obrigatório |
|---|---|---|
| `contentPt` | `string` | Sim |
| `contentEn` | `string` | Não |
| `description` | `string` | Não |
| `tags[]` | `string` (múltiplo) | Não |
| `images[]` | `File` (múltiplo) | Não |

---

## Categorias de Publicação

| Tag | Cor | Uso |
|---|---|---|
| `PESQUISA` | Azul (#004267) | Artigos e resultados de pesquisa científica |
| `PROJETOS` | Verde (#1a6b3c) | Projetos em desenvolvimento no laboratório |
| `ATIVIDADES` | Âmbar (#8a4f00) | Atividades internas e eventos do laboratório |
| `CURSOS & EVENTOS` | Roxo (#5c2d8a) | Cursos, workshops e participações externas |

---

## Acessibilidade e IHC

O desenvolvimento atual aplica sistematicamente princípios de IHC às interfaces existentes:

**Heurísticas de Nielsen implementadas**

| Heurística | Onde aplicada |
|---|---|
| #1 Visibilidade do estado | Botão "Salvando..." por post durante PATCH; toast com resultado da operação |
| #2 Controle e liberdade | Toast "Desfazer" disponível por 5s após alteração de status, sem modal |
| #3 Prevenção de erros | Modal de confirmação antes de ativar/desativar posts |
| #4 Reconhecimento em vez de memorização | Data de última modificação visível diretamente na tabela do dashboard |

**Critérios WCAG 2.2 atendidos**

| Critério | Implementação |
|---|---|
| 2.4.1 — Pular blocos | Skip-link "Pular para o conteúdo principal" + `<main tabindex="-1">` |
| 2.2.2 — Pausar, parar | Autoplay do Swiper pausa no hover (`pauseOnMouseEnter`) e no foco via teclado |
| 4.1.2 — Nome, função, valor | Setas do Swiper com `aria-label` via módulo A11y; botão toggle com `aria-pressed` |
| 4.1.3 — Mensagens de status | Toasts com `role="status"` e `aria-live="polite"` |
| 1.3.1 — Info e relações | `scope="col"` em todos os `<th>` da tabela do dashboard |
| 1.4.1 — Uso da cor | Botões de status com símbolo (✓/✗) + texto, não apenas cor |

---

## Convenções de Desenvolvimento

- Componentes Angular **sem** sufixo `.component` → `add-post.ts`, `gallery.ts`
- CSS puro por componente, sem variáveis globais nem preprocessadores
- Cor primária: `#004267` · Header: `85px` · Altura útil: `calc(100vh - 85px)`
- Formato de commits: `feat->descrição`, `fix -> descrição`, `chore -> descrição`
- `appsettings.Development.json` e `appsettings.Production.json` nunca são commitados

---

## Status do Projeto

| Módulo | Status |
|---|---|
| Autenticação JWT | Estável |
| Galeria / Carrossel | Estável |
| Feed de publicações com filtros | Estável |
| Leitura de posts | Estável |
| Editor de posts — criação | Estável |
| Editor de posts — edição | Estável |
| Dashboard de gerenciamento | Em desenvolvimento |
| Exclusão permanente de posts | Pendente |
| Testes automatizados | Pendente |
| Pipeline CI/CD | Pendente |

---

## Desenvolvido por

Laboratório LPCIAD — Universidade Católica de Santos (UniSantos)
Campus Dom Idílio José Soares · Av. Conselheiro Nébias, 300 · Santos – SP, Brasil

---

*Projeto acadêmico — todos os direitos reservados.*
