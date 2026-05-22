# LPCIADWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Avaliação da Interface

A interface deste projeto foi desenvolvida considerando critérios de qualidade de uso descritos por Barbosa et al. (2021) e está alinhada aos padrões internacionais de acessibilidade. A avaliação adota três frameworks complementares.

### 1. Heurísticas de Nielsen (1994)

| # | Heurística | Onde foi aplicada |
|---|---|---|
| 1 | Visibilidade do estado do sistema | Spinners, "Salvando...", estados loading/erro/vazio em todos os componentes |
| 2 | Correspondência com o mundo real | Linguagem do domínio acadêmico, ícones de contato, datas localizadas (pt-BR/en-US) |
| 3 | Controle e liberdade do usuário | Botões "← Voltar", limpar busca, "Limpar filtros" |
| 4 | Consistência e padronização | Design system unificado (cor `#004267`, tipografia, padrão de botões, cores de tag via `TAG_COLORS`) |
| 5 | Prevenção de erros | Confirmação antes de limpar editor; validação de login |
| 6 | Reconhecimento em vez de memorização | Data criação + modificação na tabela admin; tags visíveis nos cards; breadcrumbs no editor |
| 7 | Flexibilidade e eficiência | Cole/arraste de imagens no editor; busca combinada a filtros por tag |
| 8 | Projeto estético e minimalista | Tema claro, hierarquia tipográfica, truncamento de descrições |
| 9 | Recuperação de erros | Mensagens com sugestão de retry; toast com descrição clara |
| 10 | Ajuda e documentação | Hint inline no editor markdown; tooltip no toggle ativo/inativo |

### 2. WCAG 2.2 nível AA (W3C, 2024)

- **1.1.1 Conteúdo não-textual**: textos alternativos e `aria-hidden` em ícones decorativos.
- **1.3.1 Informações e relações**: semântica HTML; `scope="col"` em tabelas; `<caption>` na tabela admin.
- **1.4.1 Uso de cor**: estados ativo/inativo com texto + cor.
- **2.1.1 Teclado**: cards de post e demais controles navegáveis por teclado.
- **2.2.2 Pausar, parar**: carrossel pausa no foco e hover.
- **2.4.1 Pular blocos**: skip-link para o conteúdo principal.
- **2.4.7 Foco visível**: indicador amarelo global em elementos focáveis.
- **3.1.1 Idioma da página**: atributo `lang` do `<html>` atualizado dinamicamente.
- **4.1.2 Nome, função, valor**: atributos ARIA em componentes interativos; A11y do Swiper.
- **4.1.3 Mensagens de status**: `role="alert"` no toast; `aria-live` nos estados.

### 3. Comunicabilidade (Engenharia Semiótica)

- Verbos padronizados nas ações do admin (Editar, Publicar, Salvar, Limpar).
- Hint contextual no editor markdown.
- Tooltip explicativo no toggle ativo/inativo.
- Mensagens de erro descritivas com sugestão de ação.
- Estado de modificação visível (`✎ DD/MM/YYYY`) na tabela admin.

### 4. Método de avaliação previsto

Seguindo Barbosa et al. (2021, seção 12.1.1):

1. **Preparação**: definição das telas e conjunto de heurísticas + critérios WCAG.
2. **Coleta individual**: 3 a 5 avaliadores inspecionam separadamente, registrando local, descrição, heurística violada, severidade (0–4 de Nielsen) e sugestão.
3. **Consolidação**: reunião para revisão e geração do relatório consolidado.

### Referências

- BARBOSA, S. D. J. et al. **Interação Humano-Computador e Experiência do Usuário**. Autopublicação, 2021. ISBN 978-65-00-19677-1.
- NIELSEN, J. **Usability Engineering**. Academic Press, 1994.
- W3C. **Web Content Accessibility Guidelines (WCAG) 2.2**. 2024.
