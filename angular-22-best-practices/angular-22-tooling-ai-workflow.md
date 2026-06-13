# Angular 22 — Tooling, AI Integration & Agentic Workflow

> Part of the Angular 22 Best Practices set. Load for CLI usage, MCP server, official Agent Skills, updates/migrations, architecture enforcement tooling, and AI-in-the-app patterns. This document is the bridge between these best-practice files and the agents/skills/commands built on top of them.

---

## 1. Angular CLI Essentials

```bash
ng new my-app                      # zoneless, standalone, Vitest, OnPush by default
ng generate component flight-card  # honors angular.json schematics defaults
ng serve | ng build | ng test | ng lint
ng update @angular/cli @angular/core   # version bumps run codemods automatically
```

Recommended `angular.json` schematic defaults (keep generated code minimal & consistent):

```json
"schematics": {
  "@schematics/angular:component": {
    "changeDetection": "OnPush",
    "skipTests": false,
    "inlineStyle": false
  }
}
```

- The project `prefix` in `angular.json` drives selector prefixes; keep `eslint.config.js` selector rules in sync.
- Initialize linting with `ng lint` (angular-eslint); CI gates: lint + test + build + budgets.

## 2. Angular CLI MCP Server (Agent ↔ Workspace Bridge)

Agents should use the MCP server instead of guessing about the workspace:

```bash
ng mcp                      # start MCP server
ng mcp --experimental-tool  # include experimental tools
```

| Tool | Use when |
|---|---|
| `get_best_practices` | Loading the team-maintained baseline rules — combine with this document set |
| `search_documentation` | Any uncertainty about current Angular APIs (beats stale training data) |
| `find_examples` | Needing canonical modern code snippets |
| `list_projects` | Orienting in a multi-project workspace |
| `onpush_zoneless_migration` | Analyzing legacy code before a zoneless migration |
| `modernize` (experimental) | Running official migration schematics |
| `ai_tutor` (experimental) | Interactive learning sessions |

**Agent rule:** before claiming an API doesn't exist or writing version-sensitive code, consult `search_documentation` / `get_best_practices` via MCP.

## 3. Official Angular Agent Skills

The Angular team publishes maintained skills (kept in sync with the framework):

| Skill | Purpose |
|---|---|
| `angular-developer` | Code generation + architectural guidance: signals, linkedSignal, resources, forms, DI, routing, SSR, a11y, testing, CLI |
| `angular-new-app` | Scaffolding a new app with modern structure |

Install into a skills-capable agent environment:

```bash
npx skills add https://github.com/angular/skills
```

**Relationship to this document set:** the official skills carry generic Angular knowledge; *these* documents add your project's decisions (architecture matrix, Signal Forms-first, store conventions, v22 defaults). When building your own agents/skills, layer: official skill → this best-practices set → project-specific instructions. On conflict, the more specific layer wins, except security rules, which always win.

## 4. LLM Context Endpoints

- `https://angular.dev/llms.txt` — index of LLM-readable docs
- `https://angular.dev/assets/context/llms-full.txt` — full docs dump for context loading
- `https://angular.dev/ai/develop-with-ai` — official system-prompt/rules guidance

Point retrieval-augmented tooling at these for authoritative, current API truth.

## 5. Keeping Up to Date (`ng update` Workflow)

1. Read the interactive update guide at `https://angular.dev/update` (select from/to versions, complexity).
2. Update one major at a time: `ng update @angular/cli @angular/core` (add `@angular/material`, `@angular/ssr` etc. as present).
3. Trust the codemods — for v22 they automatically: insert `withXhr()` where XHR behavior was relied on, insert `withNoIncrementalHydration()` where incremental hydration wasn't previously requested, and apply API renames.
4. Run lint + tests; fix deprecation warnings *now*, not next major.
5. Only then apply opt-in modernizations from the migration checklist in the core document.

## 6. Architecture Enforcement (Sheriff & Detective)

(Full rationale → the architecture guide in this project.)

```bash
npm i -D @softarc/sheriff-core @softarc/eslint-plugin-sheriff
npx sheriff init       # creates sheriff.config.ts
npm i @softarc/detective && npx detective   # dependency-graph visualization
```

- Sheriff turns the two architecture rules (same-domain + lower-layers-only) and `internal/` privacy into **lint errors** — wire it into `eslint.config.js` and CI so violations can't merge. Prefer `enableBarrelLess: true` + `internal/` folders over `index.ts` barrels (barrels hurt tree-shaking).
- Detective visualizes module dependencies and forensic metrics — use it during reviews and refactoring planning.
- Path mappings (`"@app/*": ["src/app/domains/*"]` in `tsconfig.json`) keep imports aligned with the architecture matrix.
- Monorepos: plain CLI workspaces for simple cases; **Nx** for module-boundary rules, incremental builds, and caching at scale (Sheriff/Detective work there too).

## 7. AI *Inside* the App — Agentic UI Patterns

When the task is building AI features into the Angular app itself (chat assistants, generative UI), the book's reference approach is **Hashbrown** (`@hashbrownai/angular` + core):

- `chatResource` — signal-based chat with an LLM, including **tool calling**: expose app functions (typed with schema) the model may invoke; results flow back into the conversation.
- `uiChatResource` — **generative UI**: the model returns structured output mapped to a whitelist of *your* Angular components ("dumb components with smart wrappers"); you describe each exposed component + inputs with schemas. Never let a model emit raw HTML/templates — that reopens XSS/template-injection (see security doc).
- Natural-language → code-generation flows run model-produced logic only in a **sandboxed runtime** with explicitly registered runtime functions; apply one-/few-shot prompting in the system prompt for reliable structure.
- Keep API keys server-side (proxy/BFF); stream responses; treat all model output as untrusted input.

## 8. Foundation Contract for Future Agents/Skills/Commands

When deriving agents, skills, or slash-commands from this set:

1. **Single source of truth:** rules live here; agents reference these files instead of restating rules (restating forks the truth).
2. **Routing:** an agent's first step is the document map in `angular-22-best-practices.md` — load only the needed specialized files into context.
3. **Versioning:** these docs target Angular 22. On framework updates, update the core doc's version-facts table first, then affected specialized docs; bump the version header.
4. **Verification loop:** generated code must pass `ng lint`, `ng test`, `ng build`, and Sheriff before being presented as done.
5. **Escalation:** anything requiring `bypassSecurityTrust*`, disabling lint/architecture rules, or adding Zone.js gets flagged to a human, never silently applied.
