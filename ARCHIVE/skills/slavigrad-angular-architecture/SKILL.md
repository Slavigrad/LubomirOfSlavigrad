---
name: slavigrad-angular-architecture
description: How to inspect and understand the Slavigrad CV Angular project before any change. Read-only. Encodes verified repo facts, the target architecture (ADR-001/002/003), and what to look for. Load this whenever reasoning about Slavigrad's structure.
license: MIT
---

# Slavigrad Angular Architecture Skill (read-only)

Use this skill to understand the Slavigrad CV Angular project before implementing any
change. Read-only by default. This is repo-specific knowledge — for generic Angular 22
mechanics (signals, control flow, forms), rely on the project's Angular reference docs.

## Verified facts (re-confirm against the live repo; flag drift)

- **Angular 21.1.3**, standalone + signals, no NgModules. Angular 22 migration planned,
  not done.
- **Build:** `npm run build` → `ng build`. Prod: `npm run build:prod`. Output base:
  `dist/LubomirOfSlavigrad/browser`. Deploy: `gh-pages`.
- **Tests:** `npm test` → `ng test` (Karma + Jasmine). Very few `.spec.ts` exist — treat
  low coverage as a known risk; a green build is the main safety net today.
- **Lint gap:** `eslint` + `@typescript-eslint/*` are installed, but there is NO `lint`
  script and NO ESLint builder in `angular.json`. `ng lint` does not run. Do not claim
  lint passes. (Wiring lint is a tooling decision — ADR-005, not yet written.)
- **Styling:** Tailwind 3.4 + `class-variance-authority` + `clsx`; glass design tokens;
  global system in `src/styles.css`. The visual identity lives here — treat as
  do-not-touch during structural work.

## Target architecture (decided)

Per ADR-001, the app is **two bounded contexts + shared + shell**, with a quarantined
`lab` area (ADR-003):

```text
src/app/
  shell/                  app frame: root, nav, footer, 404
  domains/
    cv/      cv.routes.ts · feature-overview/ · data/
    memoir/  memoir.routes.ts · feature-story/ · ui/ · data/
    lab/     lab.routes.ts · feature-ui-showcase/ · feature-signal-playground/
    shared/  ui-glass/ · ui-common/ · util-performance/ · util-theme/
```

Module rules (enforced by Sheriff once ADR-005 lands):
1. `cv` and `memoir` must not import each other.
2. Domains may import `shared`; `shared` must not import any domain.
3. Within a domain: `feature → ui → data → util`, never reverse.
4. A feature must not import another feature.
5. `internal/` folders are module-private.
6. A domain's public API is its `*.routes.ts` (lazy-loaded via `loadChildren`).
7. Promote to `shared` only on the third demonstrated cross-domain use.
8. Nothing outside `lab` may import from `lab`.

The current layout is type-first and does NOT yet match this. When mapping, document
what IS and note the delta to target — do not pretend the target exists.

## Decided cleanups (context for what is dead vs. live)

Per ADR-002, the following are slated for deletion (do not treat as load-bearing):
runtime CRUD layer (`signal-crud.ts` usage), change-notification system, content
strategy, schema versioning/migration, `cloneCVData`, the hand-rolled validation
engine, search machinery. Stats and skill categories will be **derived** from data, not
stored. Genuine domain logic to KEEP: experience-duration math (overlap merge),
technology/skill derivation.

Per ADR-003: `/demo` (collapse showcase) and `modern-card`, `signal-form` move to
`lab`; `modern-lifecycle` is deleted; `performance-monitor` waits on ADR-004.

## What to look for

### Structure & bootstrap
- `src/main.ts`, `src/app/app.config.ts` (providers, router, preloading, services),
  `src/app/app.routes.ts` (every path), `src/app/app.ts` (`RouterOutlet` shell).

### Routing (real paths)
- `/` → home; `/home`,`/cv`,`/portfolio`,`/resume` → redirect to `/`;
  `/egypt-story` → memoir; `/demo` → collapse showcase; `/404`; `**` → `/404`.
  Confirm each against the real route file.

### Bounded-context boundary (ADR-001)
- Grep CV files for memoir-type imports and vice versa. Report any crossing as a fact.

### Components & data
- CV section components under `src/app/components/` (hero, stats, skills, experience,
  projects, contact). Memoir page + its single-consumer UI under `pages/egypt-story/`
  and `shared/components/`.
- `CvDataService` (`src/app/services/cv-data.service.ts`): capture its readonly signals
  and computed surface. Note which computeds have NO component consumer (dead).
- Static content in `src/app/data/`; types split across `interfaces/` and `models/`.

### Tests, styling, tooling
- Count real `.spec.ts`. Record Tailwind/glass setup. Record the lint gap and scripts.

## Stats-diff check (ADR-002 #2)

When asked: compare the literal `stats`/`skillCategories` in `cv-data.ts` against what
`generateComputedStats`/`groupSkillsByCategory` would produce from the data files.
Emit a field-by-field MATCH/DIVERGE table. DIVERGE = curated value (e.g. "12+ years")
that derivation would overwrite — flag for a human label/format decision. Read-only.

## Output

Produce `docs/slavigrad-agentic/angular-architecture-map.md` with the structure the
command specifies: functional objective, verified structure, app structure, routing,
bounded-context check, components, services/data, models, state, forms, styling, tests,
tooling, stats-diff table, patterns to reuse, safe extension points, risks/unknowns,
do-not-touch.

## Strict rules

- Verify real paths. Invent nothing. Do not modify, implement, or refactor.
- Prefer existing conventions over generic advice. Separate facts from recommendations.
- Mark unknowns as unknown. Reference ADRs by number where relevant.
