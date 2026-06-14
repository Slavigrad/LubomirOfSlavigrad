# Advanced Modern Angular Application Structure Guide

*Based on "Modern Angular" (Angular 22 edition, Chapter 8: Sustainable Architectures) — written for a Spring Boot / Kotlin / DDD developer learning Angular.*

---

## 1. The Core Philosophy in One Sentence

**Slice the application vertically by business domain first; layer each slice technically second; enforce the boundaries with tooling.**

If you know DDD and onion/hexagonal architecture in Spring Boot, you already know 80% of this. The book's reference architecture is a frontend translation of ideas you use daily:

| Spring Boot / DDD concept | Angular equivalent in this architecture |
|---|---|
| Bounded Context | **Domain** (a folder under `src/app/domains/`) |
| Package-by-feature (vs. package-by-layer) | **Vertical slicing** (vs. type-first folders like `components/`, `services/`) |
| Application layer / use case services | **`feature-*` modules** (smart components, use-case orchestration) |
| Domain model + repositories | **`data` modules** (client-side domain model, stores, HTTP access) |
| Reusable infrastructure / cross-cutting | **`util` modules** (auth, logging, date handling) |
| Reusable presentation widgets | **`ui` modules** (dumb/presentational components) |
| `internal` visibility (Kotlin), module exports (JPMS) | **`internal/` folder** or `index.ts` public API |
| ArchUnit / Spring Modulith verification | **Sheriff** (lint-enforced dependency rules) |
| Module dependency graph tooling | **Detective** (dependency visualization) |
| Modular monolith (Spring Modulith) | **Modulith** (one codebase, enforced module boundaries) |
| Microservices | **Micro Frontends** (separate codebases/deployments) |

The big mental shift: **the primary axis of organization is the business, not the technology.** A folder named `services/` tells you nothing about what the app does. A folder named `ticketing/` tells you everything.

---

## 2. Why Vertical Slicing? (The "Why" Behind Everything)

The book argues for verticals (one per business domain / bounded context) because they deliver:

1. **Low coupling** — verticals know as little as possible about each other; changes stay local.
2. **High cohesion** — things that change together live together. A change to a use case happens in one folder, not scattered across `components/`, `services/`, `models/`, `interfaces/`.
3. **Conway's Law alignment** — one team per vertical (Inverse Conway Maneuver), no stepping on toes.
4. **Reduced cognitive load** — you only need to hold one well-scoped domain in your head, not the whole system.
5. **Future-proofing** — a clean vertical can later be extracted into a library or Micro Frontend without surgery.

This is exactly the argument for bounded contexts in DDD. The anti-pattern is **horizontal/type-first structure** (`components/`, `services/`, `models/`, `pages/` at the top level): it works for tiny apps, but every feature change becomes a treasure hunt across five sibling folders, and nothing stops any file from importing any other file.

### Finding the boundaries

Same as in your backend work: DDD Strategic Design. Look at business processes, the language people use (a "flight" means something different to *booking* than to *boarding*), responsibilities, and pivotal moments where rules or perspective change. Event Storming works for frontends too. Often your frontend slicing simply mirrors your backend bounded contexts; when it can't (e.g., a workflow-style UI spanning several backend contexts), a **Backend for Frontend (BFF)** translates between the backend language and the frontend language.

---

## 3. The Architecture Matrix (The Reference Structure)

Inside each vertical, modules are categorized into **layers**. Each cell of the matrix (domain × category) becomes a module — in a modulith, simply a folder.

The four standard categories (from Nx's enterprise patterns, adopted by the book):

| Category | Contains | Spring analogy | Reusable? |
|---|---|---|---|
| **feature** | Use-case implementations with *smart components*. They talk to stores/services and orchestrate. | Application service / use case | No — deliberately use-case-specific |
| **ui** | *Dumb / presentational components.* Communicate only via inputs & outputs. No backend, no store access. Design-system components live here. | Pure view templates / reusable UI fragments | Yes |
| **data** | Client-side domain model, services that validate and call the backend, state management (stores), view models. | Domain model + repository + application state | Within the domain |
| **util** | Cross-cutting helpers: logging, auth, date handling. | `common`/infrastructure libs | Yes |

Plus a special pseudo-domain:

- **shared** — code available to *all* domains. Should be overwhelmingly **technical** (ui + util). Domain-specific code belongs in its domain, not in shared.

### The two dependency rules (memorize these)

1. **Domain rule:** a domain may only access its own modules — plus `shared`.
2. **Layer rule:** a module may only access modules in **lower** layers:
   `feature → ui → data → util` (and `util` accesses nothing).

These two rules are the entire access-control model. They prevent cycles, keep domains decoupled, and make the system navigable. They are the frontend twin of "domain layer must not depend on web layer" in your onion architecture — except here `feature` (use cases) sits on top and `util` (infrastructure helpers) at the bottom.

> **Warning from the book:** don't over-share. If most of your code ends up in `shared`, you've recreated a coupled monolith and defeated vertical slicing. Default to *local*; promote to shared only on proven, repeated need (rule of three).

---

## 4. The Concrete Folder Structure

The book's reference layout for a **modulith** (one codebase, enforced boundaries — the right choice for one or a few teams):

```
src/app
├── domains
│   ├── checkin
│   │   ├── data
│   │   └── feature-checkin
│   ├── luggage
│   │   ├── data
│   │   └── feature-luggage
│   ├── ticketing
│   │   ├── data
│   │   ├── feature-booking
│   │   ├── feature-next-flights
│   │   └── ui
│   └── shared
│       ├── ui-common
│       ├── ui-forms
│       ├── util-auth
│       └── util-common
├── shell            # app frame: home, about, sidebar, top-level navigation
├── testing          # shared test helpers (may be imported by anything)
├── app.config.ts
├── app.routes.ts
└── app.ts
```

Key observations:

- **Module names are prefixed with their category** (`feature-booking`, `ui-common`, `util-auth`). One glance tells you where a module sits in the matrix. A bare `data`, `ui`, or `util` folder is fine when a domain needs only one of that kind.
- **Inside each module** live ordinary Angular building blocks: components, directives, pipes, services, stores.
- The **shell** (root layout, top-level nav) sits outside the domains and is allowed to see everything — it's the composition root, like your Spring `@Configuration` / main application class wiring things together.

### Information hiding (module-private code)

Like Kotlin's `internal` or JPMS `exports`, each module should hide implementation details. Two mechanisms:

1. **`index.ts` barrel file** — the module's public API; bypassing it is a lint error. Downside: tedious re-exports and can hurt tree-shaking/lazy loading.
2. **Preferred: convention-based `internal/` folder** — anything inside `internal/` is private; everything else is public. No barrel needed:

```
src/app/domains/checkin/data
├── internal
│   ├── confirmations.ts
│   └── validation.ts
├── checkin-info.ts        # public
└── passenger-info.ts      # public
```

A feature module ideally exposes **only its routes** — consumers route to it and assume nothing about its internals. This is the frontend version of "expose an interface, hide the implementation."

### Feature-local code (Vertical Slice Architecture)

When a feature's building blocks (dumb components, store, backend access) are not reused anywhere else, **co-locate them inside the feature module** rather than spreading them across `ui`/`data`. This is Jimmy Bogard's Vertical Slice Architecture: maximal cohesion, minimal cognitive load. Promote things *out* of the feature into `data`/`ui` only when a second feature actually needs them. (Same instinct as not creating a `@Service` interface + impl pair "just in case".)

---

## 5. Routing & Lazy Loading Follow the Structure

The structure isn't just folders — it drives how the app loads:

- **Each domain owns a routes file** (`ticketing.routes.ts`) exporting its `Routes` (ideally as `default` export). This is often the domain's *only* public API.
- The root `app.routes.ts` lazy-loads each domain with `loadChildren`:

```ts
// src/app/app.routes.ts
{
  path: 'ticketing',
  loadChildren: () => import('./domains/ticketing/ticketing.routes'),
},
```

- Large rarely-used components can be lazy-loaded individually with `loadComponent`.
- Add `withPreloading(PreloadAllModules)` in `app.config.ts` so lazy domains load in the background after startup — fast start *and* instant navigation.

Result: domain boundaries = bundle boundaries. Decoupling pays off in startup performance, for free.

---

## 6. Enforcement: Sheriff (Your ArchUnit) and Detective

Conventions die without enforcement — you know this from Java. The book's answer is **Sheriff**, which turns the two dependency rules into ESLint errors (in the IDE as you type, and in CI):

```bash
npm i @softarc/sheriff-core @softarc/eslint-plugin-sheriff -D
```

```ts
// sheriff.config.ts
import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  enableBarrelLess: true,            // use internal/ folders, no index.ts needed
  modules: {
    'src/app/domains/<domain>': {
      'feature-<name>': ['domain:<domain>', 'type:feature'],
      'ui-<name>':      ['domain:<domain>', 'type:ui'],
      'data-<name>':    ['domain:<domain>', 'type:data'],
      'util-<name>':    ['domain:<domain>', 'type:util'],
      data: ['domain:<domain>', 'type:data'],
      ui:   ['domain:<domain>', 'type:ui'],
      util: ['domain:<domain>', 'type:util'],
    },
    'src/app/testing': ['testing'],
  },
  depRules: {
    root: '*',                                          // shell sees everything
    'domain:*': [sameTag, 'domain:shared'],             // Rule 1
    'type:feature': ['type:ui', 'type:data', 'type:util'],  // Rule 2
    'type:ui':      ['type:data', 'type:util'],
    'type:data':    ['type:util'],
    'type:util':    [],
    testing: '*',
    '*': ['testing'],
  },
};
```

Folder names are matched against placeholders (`<domain>`, `<name>`) and tagged; `depRules` constrain who may import whom. Import a feature from a ui module → red squiggle, failed build. Exactly the workflow of ArchUnit rules in your CI, but with instant IDE feedback.

**Detective** (`npm i @softarc/detective && npx detective`) visualizes the actual dependency graph between your modules — thick edges mean many imports. Use it to verify high cohesion *inside* domains and thin connections *between* them, and to spot smells like one feature depending on another feature.

Bonus: configure **path mappings** in `tsconfig.json` (e.g., `@demo/ticketing/*`) so imports read like module names instead of `../../../../` chains.

---

## 7. Modern Angular Conventions That Shape the Structure (Angular 20+)

- **No NgModules.** Standalone components are the unit of composition; "module" in this guide means a *folder with rules*, not `@NgModule`.
- **No `Component` suffixes.** The updated Angular Style Guide dropped them: the class is `FlightSearch` in `flight-search.ts` (not `FlightSearchComponent` / `flight-search.component.ts`). The book recommends purpose-revealing endings like `-search`, `-edit`, `-card` instead.
- **Signals everywhere** for state; smart components in `feature-*` consume stores (signal-based services or NgRx SignalStore) that live in `data` (when shared across features of a domain) or inside the feature itself (when feature-local).
- **Stores are placed where the state belongs**: feature-local store → in the feature; domain-shared state → in the domain's `data` module; truly global, technical state → `shared`. Keep stores small and responsibility-scoped; coordinate them via orchestration or events to avoid cycles.
- **`ChangeDetectionStrategy.OnPush`** as default; dumb `ui` components communicate strictly via `input()`/`output()`.

---

## 8. "Where Does This Belong?" — The Decision Algorithm

Ask these questions **in order** for any new file:

**Q1. Which business domain does it belong to?**
Think bounded context: whose ubiquitous language does this code speak? If you can name the domain → it goes under `domains/<that-domain>/`. If it's genuinely domain-agnostic *technical* code → candidate for `shared` (continue at Q4).
*Smell check:* if you're tempted to put domain logic in `shared` "because two domains need it," first ask whether the two domains actually mean the same thing by it (different bounded contexts often need different models of the "same" entity — booking's Flight ≠ boarding's Flight).

**Q2. Which layer is it?**
- Does it orchestrate a use case / know about the backend or a store / is it a routed page? → **feature**
- Is it a presentational widget that only takes inputs and emits outputs? → **ui**
- Is it the domain model, backend access, validation, or shared-within-domain state? → **data**
- Is it a generic helper (dates, logging, auth plumbing)? → **util**

**Q3. Is it used by more than one feature?**
- No → keep it **inside the feature module** (vertical slice; even its dumb components and store). Co-location beats premature generalization.
- Yes, but only within this domain → the domain's `ui` or `data` module.
- Yes, across domains → `shared` (Q4).

**Q4. (For `shared` candidates) Is it technical, stable, and truly generic?**
`shared` should contain mostly `ui-*` and `util-*` modules — design-system components, auth, logging. Every addition to `shared` couples all domains to it. When in doubt, duplicate locally first; promote on the third use.

**Q5. Is it public or private within its module?**
Only what other modules legitimately need is public (often just routes, model types, and a store/service facade). Everything else → `internal/`.

Quick examples:

| Thing | Answer |
|---|---|
| Routed "Flight Search" page | `domains/ticketing/feature-booking/flight-search/` |
| Reusable `FlightCard` used by two ticketing features | `domains/ticketing/ui/` |
| `Flight` model + `FlightService` (HTTP) + ticketing store | `domains/ticketing/data/` |
| Date-formatting helper used everywhere | `domains/shared/util-common/` |
| Design-system button | `domains/shared/ui-common/` |
| Auth interceptor & token service | `domains/shared/util-auth/` |
| Validation logic only the checkin data module uses | `domains/checkin/data/internal/` |
| App sidebar / top nav | `shell/` |

---

## 9. Critique of the Two Example Structures

**The "slavigrad" CV site** (type-first: `components/`, `data/`, `interfaces/`, `models/`, `pages/`, `services/`, `shared/`):
Classic horizontal layering — and for a small personal site it's *survivable*, but it has the known failure modes: `interfaces/` and `models/` as separate top-level buckets split one concern into two places; `components/` vs `pages/` vs `shared/components/` gives three plausible homes for any component (the "where do I put it?" question this guide exists to kill); and nothing expresses what the site *is about*. Restructured per the book, `hero`, `projects`, `skills`, `contact` etc. would become features (or, since a portfolio is arguably one domain, feature folders inside a single vertical), each carrying its own model and data access.

**The "isak-relaunch" Swiss app** (`core/`, `features/`, `layout/`, `shared/`):
Much closer to best practice — this is the well-known "core/features/shared" pattern, essentially a single-domain version of the architecture matrix: `features/*` ≈ feature modules, `shared/components` ≈ ui, `layout` ≈ shell, `core` ≈ util/data infrastructure. What it lacks versus the book's reference architecture: an explicit **domain level** (admin, surveys, compensation, masterdata, insurer… look like they may be several bounded contexts flattened into one `features/` list), **category-prefixed modules** with explicit data ownership per domain (where do this app's models and stores live, and who may touch them?), and **enforcement** — without Sheriff, `features/admin` may freely import from `features/surveys` and nobody notices until it's spaghetti. With ~13 features, grouping them into 3–5 domains with per-domain `data` modules and Sheriff rules would be the natural next maturity step.

---

## 10. From-Scratch Checklist for a New Project

1. `ng new my-app` — standalone, strict mode; run `ng lint` once to set up ESLint.
2. **Model the domains first** (Event Storming / talk to the business). Even a guess is better than `components/`. One domain is fine to start — the structure still works: `domains/<the-one-domain>/feature-*`.
3. Create the skeleton: `src/app/domains/<domain>/{feature-…, data, ui?}`, `domains/shared/{ui-common, util-common}`, `shell/`.
4. **Set up Sheriff and the dep rules on day one** (and optionally Detective). Retrofitting boundaries is 10× harder than starting with them.
5. Give each domain a `*.routes.ts`; wire them in `app.routes.ts` via `loadChildren`; enable preloading.
6. Configure path mappings for clean imports.
7. Per use case: scaffold into the feature (`ng g c domains/ticketing/feature-booking/flight-search`), keep building blocks feature-local, promote to `data`/`ui`/`shared` only on demonstrated reuse, hide privates in `internal/`.
8. Periodically open Detective and check: thick edges *within* domains, thin edges *between* them, no feature→feature dependencies, lean `shared`.

When the project outgrows a single app (multiple teams, reuse across apps), the same matrix scales up: folders become **libraries in an Nx monorepo** (module boundaries via tags in `project.json`) and ultimately, if team autonomy demands it, **Micro Frontends** — same architecture, bigger building blocks.

---

## TL;DR

> **Domains outside, layers inside, sheriff at the gate.**
> Slice by bounded context (`domains/<domain>`), layer each slice (`feature → ui → data → util`), share only technical code (`shared`), hide module internals (`internal/`), expose routes as the public API, lazy-load per domain, and let Sheriff fail the build when anyone cheats. Everything you know from DDD and modular monoliths in Spring applies — only the vocabulary changed.
