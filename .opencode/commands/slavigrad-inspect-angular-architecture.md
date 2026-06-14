---
description: Read-only inspection of the Slavigrad CV Angular project. Produces a verified architecture map. Changes NO application code.
agent: slavigrad-angular-architect
---

# Slavigrad — Inspect Angular Architecture

Inspect the Slavigrad CV Angular project architecture, focused on: {{topic}}

Use the `slavigrad-angular-architect` agent. Work **read-only**. Before writing code,
produce a trustworthy map of what actually exists.

## Hard rules

- Read-only. Do not edit, create, move, or delete any file under `src/`.
- The only file you may write is the output map (path below).
- Verify every path with `glob`/`grep`/`read` before naming it. Do not invent files,
  routes, services, components, or symbols.
- Separate **facts** (verified from the repo) from **recommendations** (your opinion).
  Label recommendations as such.
- If you cannot verify something, mark it `UNKNOWN — needs human confirmation`. Never
  upgrade a guess to a fact.
- Prefer existing project conventions over generic Angular advice.

## Verified ground truth (confirm, do not assume)

These were established from the repo and project ADRs. Re-confirm each against the
live tree; flag any drift:

- Angular **22.0.1** (all `@angular/*` at `^22.0.1` in `package.json`). Angular 22
  migration is complete.
- Build: `npm run build` (`ng build`, `@angular/build:application`). Output path base
  `dist/LubomirOfSlavigrad/browser`.
- Tests: `npm test` (`vitest run` via `@analogjs/vitest-angular` + jsDOM).
- Lint: **wired** — `npm run lint` runs ESLint flat config (`eslint.config.js`) with
  `angular-eslint` v22 and `@softarc/eslint-plugin-sheriff`. There is NO `ng lint`
  architect in `angular.json`, but `npm run lint` works. Do NOT report lint as missing.
- The app is two bounded contexts (cv, memoir) + shared + shell + lab — see
  ADR-001/003. The current layout **is** domain-based (`src/app/domains/`). The
  ADR-001 restructure is complete.
- ADR-002 cleanups: speculative machinery deleted (signal-crud, change-notification,
  validation engine, search, cloneCVData, etc.). Stats remain as authored static
  content (curated claims, see ADR-002 §"Stats: fact vs. claim").
- ADR-003 executed: lab domain exists with collapse-demo, modern-card, signal-form.
  One item REMAINS OPEN: `modern-lifecycle` (ADR-003 verdict: DELETE) still exists at
  `src/app/domains/lab/modern-lifecycle/`.
- ADR-004 executed: SignalStateService, PerformanceService, BundleAnalyzerService,
  CacheService deleted. ImageOptimizationService kept (unwired).
- Sheriff (`sheriff.config.ts`) exists with domain modules defined but **permissive**
  rules (`'*': '*'`). Report this as a gap.
- ADRs are stored in `ARCHIVE/ADR/` (not `docs/adr/`).

## Your job

1. Inspect the repository structure (the real `src/` tree).
2. Confirm real paths with `glob`/`grep`/`read`.
3. Identify existing Angular patterns and name a concrete file for each.
4. Identify analogous implementations before anyone suggests changes.
5. Produce the technical map.

Focus areas: app bootstrap & config; routing (real route file + every path);
standalone components; the two domains' boundaries (do any CV files import memoir files
or vice versa? — verify, this matters for ADR-001); component organization & naming;
services & data access; the `CvDataService` signal/computed surface; models &
interfaces; guards & interceptors (likely none — confirm); state management (signals);
forms & validation; styling (Tailwind + glass design tokens + `src/styles.css`);
test coverage (how many `.spec.ts` actually exist?); build & tooling.

## Special verification task — stats-diff check (feeds ADR-002 #2)

ADR-002 decided to **derive** computed stats and skill categories from data (single
source of truth) and delete the static copies. Before that deletion is safe, we must
know whether the static copies contain _curated_ values the derivation can't reproduce.

Do this, read-only:

1. Read `src/app/domains/cv/data/cv-data.ts` and capture the literal `stats` and
   `skillCategories` values it provides.
2. Read `generateComputedStats` and `groupSkillsByCategory` in
   `src/app/domains/cv/data/cv-data.utils.ts` and determine, by tracing the logic
   against the real data files (`experience-data.ts`, `projects-data.ts`,
   `skills-data.ts`), what those functions WOULD produce.
3. Report a field-by-field diff: for each stat/category field, `MATCH` (derivation
   reproduces the static value — safe to derive) or `DIVERGE` (static value is curated,
   e.g. "12+ years" vs a computed `11.3` — flag for human decision on label/format).
4. Do NOT change anything. This is evidence for future cleanup decisions.

## Output

Write exactly one file:

```text
docs/slavigrad-agentic/angular-architecture-map.md
```

Required structure:

```md
# Slavigrad Angular Architecture Map

## Functional Objective

One sentence: what this Angular project does.

## Verified Repository Structure

Real directories/files (cite paths).

## Angular Application Structure

Bootstrap, app.config, app.ts shell.

## Routing

Real route file; every path and what it loads.

## Bounded Context Boundaries (ADR-001 check)

CV files, memoir files, and whether any import crosses between them. Facts only.

## Components

Organization, naming, smart/dumb split if any.

## Services and Data Access

Services; the CvDataService signal/computed API surface.

## Models and Interfaces

DTOs/interfaces/types and where they live.

## State Management

Signals/computed/effects usage.

## Forms and Validation

What exists today.

## Styling

Tailwind, glass tokens, styles.css, component styles.

## Tests

Actual count and location of .spec.ts files; coverage gaps.

## Build and Tooling

Angular version, scripts, the lint gap, output path.

## Stats-Diff Check (ADR-002 #2)

Field-by-field MATCH/DIVERGE table for stats and skillCategories.

## Existing Patterns To Reuse

Concrete examples from real files.

## Safe Extension Points

Where future work can attach.

## Risks and Unknowns

Anything unverified or surprising.

## Do Not Touch Yet

Areas needing explicit approval before change.

## Open ADR Items

- modern-lifecycle (ADR-003: DELETE) still present in lab
- Sheriff rules permissive (not enforced)
- ImageOptimizationService (ADR-004: KEEP) present but unwired
- Zoneless migration pending (currently uses provideZoneChangeDetection)
```

## Definition of done

- Map written; every path in it is real.
- Bounded-context import check answered with facts.
- Stats-diff table complete.
- Open ADR items reported.
- No application file modified (`git status` clean except the map).
