---
description: Read-only inspection of the Angular 22 project. Produces a verified, up-to-date architecture map from the live codebase. Decision-independent — reflects the repo as it is now, not any ADR. Changes NO application code.
agent: slavigrad-angular-architect
---

# Slavigrad — Inspect Angular Architecture

Inspect the Angular 22 project architecture, focused on: {{topic}}
(omit `{{topic}}` to map the whole app).

Use the `slavigrad-angular-architect` agent. Work **read-only**. Produce a trustworthy
map of what **actually exists right now**. This command is universal and
decision-independent: discover the structure, toolchain, and conventions from the live
tree every run. Do not assume any migration, restructure, or ADR is done or pending —
verify and report the present state. Treat anything under `ARCHIVE/` as historical
context only, never as current fact.

## Hard rules

- Read-only. Do not edit, create, move, or delete any file under `src/`.
- The only file you may write is the output map (path below).
- Verify every path with `glob`/`grep`/`read` before naming it. Do not invent files,
  routes, services, components, or symbols.
- Separate **facts** (verified from the repo now) from **recommendations** (your opinion).
  Label recommendations as such.
- If you cannot verify something, mark it `UNKNOWN — needs human confirmation`. Never
  upgrade a guess to a fact.
- Prefer existing project conventions over generic Angular advice. Measure against the
  `angular-22-best-practices/` docs and flag deviations; do not silently rewrite them.

## Discover the toolchain (do not assume it)

Read these and report the **actual** commands and config — never hardcode a runner or
version from memory:

- `package.json` → the real `scripts` (build, test, lint, format, deploy) and the
  `@angular/*` version range.
- `angular.json` → builder, output path, prefix, schematic defaults.
- `eslint.config.*` / `sheriff.config.*` → whether lint and boundary rules are wired,
  and whether Sheriff rules are enforced or permissive.
- Test config (e.g. `vitest.config.*`, `karma.conf.*`, or analog plugin) → which runner
  is in use and how `npm test` actually runs.
- `tsconfig*.json` → strictness and path aliases.

## Your job

1. Inspect the real `src/` tree and confirm every path with `glob`/`grep`/`read`.
2. Identify the existing Angular patterns and name a concrete file for each.
3. Identify analogous implementations before anyone suggests changes.
4. Verify the dependency boundaries that the structure implies.
5. Produce the technical map.

Focus areas: app bootstrap & config; change-detection setup (zoneless vs
`provideZoneChangeDetection`); routing (real route file + every path); standalone
components; domain/layer structure under `src/app/` and whether boundaries hold (do any
domains import each other? does `shared` import a domain? is `feature → ui → data → util`
respected? — verify with grep, report crossings as facts); component organization &
naming vs the v22 style guide; services & data access; each service's public
signal/computed/method surface (note members with no consumer); models & interfaces;
guards & interceptors; state management (signals/computed/effects); forms & validation;
styling (design tokens, Tailwind, global styles, component styles); test coverage (how
many `.spec.ts` actually exist and where?); build & tooling.

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

Real route file; every path and what it loads (lazy vs eager).

## Domain & Layer Structure

The real top-level layout under `src/app/` (domains, shell, shared, etc.) and the layers
inside each domain.

## Dependency Boundaries

Whether domains import each other, whether `shared` imports a domain, and whether the
`feature → ui → data → util` layer order holds. Facts only, with paths. Note whether
Sheriff is wired and enforced or permissive.

## Components

Organization, naming (vs the v22 style guide), smart/dumb split if any.

## Services and Data Access

Each service and its public signal/computed/method surface; note members with no consumer.

## Models and Interfaces

DTOs/interfaces/types and where they live.

## State Management

Signals/computed/effects usage; change-detection setup (zoneless vs zone-based).

## Forms and Validation

What exists today (Signal Forms / Reactive / template-driven).

## Styling

Design tokens, Tailwind, global styles, component styles.

## Tests

Actual count and location of `.spec.ts` files; coverage gaps.

## Build and Tooling

The real Angular version, scripts, runner, linter, output path — as read from config.

## Existing Patterns To Reuse

Concrete examples from real files.

## Safe Extension Points

Where future work can attach.

## Deviations From angular-22-best-practices

Anything that diverges from the project's v22 conventions, with the rule and file cited.

## Risks and Unknowns

Anything unverified or surprising.

## Do Not Touch Yet

Areas needing explicit approval before change.
```

## Definition of done

- Map written; every path in it is real.
- Toolchain reported from actual config (not assumed).
- Dependency-boundary check answered with facts.
- Deviations from the v22 conventions listed with citations.
- No application file modified (`git status` clean except the map).
