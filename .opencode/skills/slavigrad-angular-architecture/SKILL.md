---
name: slavigrad-angular-architecture
description: How to inspect and understand the Slavigrad CV Angular project before any change. Read-only. Encodes verified repo facts, the target architecture (ADR-001/002/003/004/005), and what to look for. Load this whenever reasoning about Slavigrad's structure.
license: MIT
---

# Slavigrad Angular Architecture Skill (read-only)

Use this skill to understand the Slavigrad CV Angular project before implementing any
change. Read-only by default. This is repo-specific knowledge — for generic Angular 22
mechanics (signals, control flow, forms), rely on the project's Angular reference docs.

## Verified facts (re-confirm against the live repo; flag drift)

- **Angular 22.0.1**, standalone + signals, zoneless-ready but uses
  `provideZoneChangeDetection({ eventCoalescing: true })` in app.config.ts. No
  NgModules.
- **Build:** `npm run build` → `ng build` (`@angular/build:application`). Prod:
  `npm run build:prod`. Output base: `dist/LubomirOfSlavigrad/browser`.
  Deploy: `gh-pages`.
- **Tests:** `npm test` → `vitest run` (via `@analogjs/vitest-angular` + jsDOM).
  5 `.spec.ts` files exist. Vitest, not Karma/Jasmine.
- **Lint:** wired — `npm run lint` → `eslint .` (flat config with `angular-eslint`
  v22, `typescript-eslint`, and `@softarc/eslint-plugin-sheriff`). No `ng lint`
  architect. `npm run lint:fix` available.
- **Format:** Prettier wired — `npm run format:check` / `npm run format`.
- **Styling:** Tailwind 3.4.17 + `class-variance-authority` 0.7.1 + `clsx` 2.1.1;
  "Smoked Crystal" design system; global system in `src/styles.css` (446 lines,
  glass tokens, aurora backgrounds, animations). Visual identity — treat as
  do-not-touch during structural work.

## Architecture (verified — matches live repo)

Per ADR-001, the app is **two bounded contexts + shared + shell + lab** (ADR-003):

```text
src/app/
  shell/                          app frame: root component, nav, footer, 404
  domains/
    cv/                           cv domain
      cv.routes.ts                public API (lazy-loaded)
      feature-overview/           home page + 6 section components (hero, stats,
                                  skills, experience, projects, contact)
      data/                       cv-data.interface.ts, cv-data.ts, cv-data.service.ts,
                                  cv-data.utils.ts, experience-data.ts, projects-data.ts,
                                  skills-data.ts
    memoir/                       memoir domain
      memoir.routes.ts            public API (lazy-loaded)
      feature-story/              egypt-story component
      ui/                         chapter-navigation, reading-progress,
                                  scroll-to-top, social-share
      data/                       egypt-story-data.ts, egypt-memoir-structured.json
    shared/                       shared domain (no domain imports)
      ui-glass/                   design system: accordion, badge, button, card,
                                  collapse, input, loading, modal, etc.
      util-performance/           image-optimization.service, lazy-image.directive,
                                  preloading.strategy, constants, utils
      util-theme/                 theme.service
    lab/                          quarantined experiments (Rule 8: nothing imports lab)
      collapse-demo/              ui-showcase (mounted at /demo)
      modern-card/                signal-API demo
      modern-lifecycle/           **ADR-003 verdict: DELETE — still present**
      signal-form/                signal-forms prototype
```

Module rules (Sheriff config defines these; currently permissive — gap to report):

1. `cv` and `memoir` must not import each other.
2. Domains may import `shared`; `shared` must not import any domain.
3. Within a domain: `feature → ui → data → util`, never reverse.
4. A feature must not import another feature.
5. `internal/` folders are module-private.
6. A domain's public API is its `*.routes.ts` (lazy-loaded via `loadChildren`).
7. Promote to `shared` only on the third demonstrated cross-domain use.
8. Nothing outside `lab` may import from `lab`.

## ADR execution status (what's done, what's open)

All 5 ADRs accepted. Files at `ARCHIVE/ADR/`.

| ADR | Title                | Status   | Key cleanups executed                                |
| --- | -------------------- | -------- | ---------------------------------------------------- |
| 001 | Bounded contexts     | Accepted | Domain structure in place; Sheriff permissive        |
| 002 | CV data cleanup      | Accepted | Speculative machinery deleted; stats stay curated    |
| 003 | Demo route & lab     | Accepted | Lab created; **modern-lifecycle NOT yet deleted**    |
| 004 | Performance services | Accepted | SignalState/Performance/BundleAnalyzer/Cache deleted |
| 005 | Tooling baseline     | Accepted | Vitest, ESLint, Prettier, Sheriff installed          |

**Open items:**

- `modern-lifecycle` (ADR-003: DELETE) still present in `domains/lab/modern-lifecycle/`
- Sheriff rules permissive (`'*': '*'`) — not yet enforced
- ImageOptimizationService (ADR-004: KEEP) present but unwired — no consumer
- Zoneless migration pending (currently `provideZoneChangeDetection`)
- Root-level empty `src/app/shared/` dir (`.DS_Store` only) — leftover

## What to look for

### Structure & bootstrap

- `src/main.ts`, `src/app/app.config.ts` (providers, router, preloading, services),
  `src/app/app.routes.ts` (every path), `src/app/app.ts` (`RouterOutlet` shell).

### Routing (real paths)

- `/` → lazy `cv.routes` → `HomeComponent` (with `/home`,`/cv`,`/portfolio`,`/resume`
  redirects to `/`)
- `/egypt-story` → lazy `memoir.routes` → `EgyptStoryComponent`
- `/demo` → `CollapseDemoComponent` (lazy, direct — not yet under lab routes)
- `/404` → `NotFoundComponent`
- `**` → redirect to `/404`

### Bounded-context boundary (ADR-001)

- Grep CV files for memoir-type imports and vice versa. Report any crossing as a fact.

### Components & data

- CV section components under `src/app/domains/cv/feature-overview/` (hero, stats,
  skills, experience, projects, contact). Memoir UI under `domains/memoir/ui/`.
- `CvDataService` (`src/app/domains/cv/data/cv-data.service.ts`): capture its readonly
  signals and computed surface. Note which computeds have NO component consumer.
- Static content in `src/app/domains/cv/data/`; types in `cv-data.interface.ts`.

### Tests, styling, tooling

- 5 `.spec.ts` files. Record Tailwind/glass setup. Record the Sheriff gap.

## Stats-diff check (ADR-002 #2)

When asked: compare the literal `stats`/`skillCategories` in `cv-data.ts` against what
`groupSkillsByCategory` would produce from the skills data files.
Emit a field-by-field MATCH/DIVERGE table. DIVERGE = curated value (e.g. "12+ years")
that derivation would overwrite — flag for a human label/format decision. Read-only.

## Output

Produce `docs/slavigrad-agentic/angular-architecture-map.md` with the structure the
command specifies: functional objective, verified structure, app structure, routing,
bounded-context check, components, services/data, models, state, forms, styling, tests,
tooling, stats-diff table, patterns to reuse, safe extension points, risks/unknowns,
do-not-touch, and open ADR items.

## Strict rules

- Verify real paths. Invent nothing. Do not modify, implement, or refactor.
- Prefer existing conventions over generic advice. Separate facts from recommendations.
- Mark unknowns as unknown. Reference ADRs by number where relevant.
