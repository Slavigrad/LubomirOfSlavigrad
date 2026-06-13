# Angular 22 Best Practices — Core Document

> **Version**: 3.0 — June 2026
> **Covers**: Angular 22 (most rules apply to 20/21; version-specific rules are tagged `[v22]`, `[v21]`, etc.)
> **Audience**: LLMs and AI coding agents first, humans second.
> **Sources**: angular.dev (v22 docs, style guide, best practices), *Modern Angular* by Manfred Steyer (2nd ed., Angular 22, June 2026), Angular team release notes.
> **Role**: This is the ROUTER document. It contains the universal rules and tells you which specialized document to load for deeper work. Always apply this document. Load specialized documents on demand.

---

You are an expert in TypeScript and Angular 22. You write functional, maintainable, performant, accessible, and secure code following modern Angular best practices. You never emit legacy patterns (NgModules, decorators for inputs/outputs, structural directives, Zone.js assumptions) unless explicitly asked to work in a legacy codebase.

---

## 1. Document Map — When to Load What

| Load this document | When the task involves |
|---|---|
| `angular-22-components-templates.md` | Creating/editing components, directives, templates, control flow (`@if/@for/@switch/@defer`), inputs/outputs, content projection, host bindings, queries, images |
| `angular-22-signals-reactivity.md` | State with signals, `computed`, `linkedSignal`, `effect`, `debounced`, resources (`resource`, `httpResource`, `rxResource`), data fetching, RxJS interop, race conditions |
| `angular-22-di-services-state.md` | Services, `@Service`/`@Injectable`, `inject()`, `injectAsync`, providers & scopes, lightweight signal stores, NgRx SignalStore, mutations, unidirectional data flow |
| `angular-22-forms.md` | Any form work — Signal Forms (default in v22), validation, schemas, submission, form arrays, custom fields; legacy Reactive Forms |
| `angular-22-routing.md` | Routes, lazy loading, guards, resolvers, route params, initializers, interceptors, preloading |
| `angular-22-performance-ssr.md` | Performance, zoneless change detection, `@defer`, SSR, hydration (incremental is default in v22), event replay, bundle size, profiling |
| `angular-22-security-a11y-errors.md` | Security (XSS, sanitization, CSP, Trusted Types, XSRF, auth patterns), accessibility (WCAG, Angular Aria), error handling strategy |
| `angular-22-testing.md` | Writing or fixing tests — Vitest (default runner), TestBed, mocking, fake timers, HTTP testing |
| `angular-22-tooling-ai-workflow.md` | Angular CLI, MCP server, official Agent Skills, `ng update`/migrations, linting, Sheriff/Detective, llms.txt |
| `advanced-modern-angular-application-structure-guide.md` (existing, in this project) | Application architecture: vertical slicing, domains, modulith structure, dependency rules, where files belong |

If the task spans several areas, load all relevant documents. If in doubt about where a new file belongs, consult the architecture guide before creating it.

---

## 2. Angular 22 — What Changed (Critical Version Facts)

An LLM trained before mid-2026 likely does not know these. Treat this table as ground truth.

| Change | Status in v22 | Replaces |
|---|---|---|
| `ChangeDetectionStrategy.OnPush` is the **default** | Default `[v22]` | Explicit `Default` strategy |
| `@Service()` decorator from `@angular/core` | New `[v22]`, identical semantics | `@Injectable({ providedIn: 'root' })` |
| `resource`, `httpResource`, `rxResource` | **Stable** `[v22]` | Experimental status in 19–21 |
| `debounced(signal, ms)` helper | New `[v22]` | Manual RxJS debounce bridges |
| `injectAsync(loader, { on, prefetch })` | New `[v22]` | Eager injection of heavy services |
| `never(expr)` in `@default` for exhaustive `@switch` | New `[v22]` | Non-exhaustive switch checks |
| `HttpClient` uses **FetchBackend by default**; `withFetch()` deprecated; `withXhr()` opt-out (needed for upload progress) | Default flip `[v22]` | XHR backend default |
| `reportDownloadProgress` / `reportUploadProgress` options | New `[v22]` | Deprecated `reportProgress` |
| `provideClientHydration()` enables **incremental hydration automatically**; `withNoIncrementalHydration()` to opt out | Default flip `[v22]` | Opt-in `withIncrementalHydration()` |
| Signal Forms (`@angular/forms/signals`) are the standard forms approach; `when`-property API for `disabled`/`readonly`/`hidden` | Standard `[v22]` | Positional condition arg `[≤v21]`; Reactive Forms remain supported |
| Zoneless change detection is the default; new projects ship **without Zone.js** | Default since `[v21]` | Zone.js-based CD |
| Vitest is the default test runner in the CLI | Default since `[v21]` | Jasmine/Karma |
| Route-level providers auto cleanup: `withExperimentalAutoCleanupInjectors()` | Experimental since `[v21.1]` | Environment injectors living forever |
| Class/file suffixes (`*Component`, `*.component.ts`) removed from style guide & CLI defaults | Since `[v20]` | `FlightSearchComponent` → `FlightSearch`, `flight-search.component.ts` → `flight-search.ts` |
| `standalone: true` is implicit — never write it | Since `[v19/20]` | Explicit flag |

---

## 3. Universal Rules (Always Apply)

### TypeScript
- `"strict": true` in `tsconfig.json`. Never weaken it.
- Prefer type inference; annotate only when inference is insufficient (`signal<User[]>([])`).
- **Never** use `any`. Use `unknown` and narrow.
- Mark properties initialized by Angular (`input()`, `model()`, `output()`, queries, `inject()`) as `readonly`.
- Avoid generic file names (`utils.ts`, `helpers.ts`, `common.ts`). Name files after their content.

### Components (full rules → components-templates doc)
- Standalone is implicit. **Never write `standalone: true`.** Never create NgModules.
- Write `changeDetection: ChangeDetectionStrategy.OnPush` explicitly in every component, even though it is the default in v22 — it is self-documenting and backward compatible.
- Use `input()` / `input.required()` / `output()` / `model()` — never `@Input()` / `@Output()` decorators.
- Use `viewChild()` / `contentChild()` signal queries — never `@ViewChild` / `@ContentChild` decorators.
- Use the `host: {}` object — never `@HostBinding` / `@HostListener`.
- `protected` for members used only in the template; `private` for internals.
- Class names without suffix (`FlightSearch`), files in kebab-case without suffix (`flight-search.ts`). Keep your own meaningful suffixes only when they add information (e.g., `FlightCard`, `FlightStore`).

### Templates
- Native control flow only: `@if`, `@for` (with mandatory `track`), `@switch`, `@defer`. **Never** `*ngIf`, `*ngFor`, `*ngSwitch`.
- `[class.x]` / `[style.x]` bindings — never `ngClass` / `ngStyle`.
- Keep templates simple; move complex logic into `computed()`.
- Name event handlers for what they do (`saveFlight()`), not the event (`handleClick()`).

### Files, Styling & Text
- Component file set: `.ts` always; separate `.html` only for non-trivial templates (inline below ~15 lines); a style file **only** when component-specific styles exist — **never generate empty `.scss` files**.
- Styling comes from the design system (global theme, tokens, UI library classes) first; component stylesheets are a last resort for genuinely component-specific layout. Never restyle primitives locally.
- User-facing strings are never literals in templates or TS. Use the project's i18n mechanism (runtime: ngx-translate/Transloco with `assets/i18n/<locale>.json`; or compile-time: `@angular/localize`). TS "text constants" objects are an anti-pattern, not i18n.

### Reactivity (full rules → signals-reactivity doc)
- Signals are the default for all state. `computed()` for derivation, `linkedSignal()` for derived-but-writable, resources for async data.
- Effects are a **last resort** — only for syncing with non-reactive APIs (DOM, canvas, localStorage, logging). Never trigger business logic or copy state between signals in an effect.
- Immutable updates only: `users.update(list => [...list, u])`. `mutate()` does not exist.

### Dependency Injection (full rules → di-services-state doc)
- `inject()` function only — never constructor parameter injection.
- `@Service()` on services `[v22]` (or `@Injectable({ providedIn: 'root' })` for ≤v21 compatibility).
- Keep components thin; business logic lives in services/stores.

### Data Access
- Reading data: `httpResource` (stable in v22). Writing data: `HttpClient` directly, or `httpMutation` with NgRx SignalStore.
- `provideHttpClient()` alone is correct in v22 (Fetch is the default backend). Do not add `withFetch()`.

### Architecture (full rules → the structure guide in this project)
- Organize by business domain (vertical slicing), never by technical type. No top-level `components/`, `services/`, `models/` folders.
- Layer inside each domain: `feature → ui → data → util`. A module may only depend on lower layers and on `shared`.
- Hide implementation details in an `internal/` folder; enforce boundaries with Sheriff.

### Quality Gates
- All code must pass strict TypeScript, ESLint, and existing tests.
- Accessibility: semantic HTML, WCAG 2.2 AA minimums, keyboard operability (→ security-a11y-errors doc).
- Security: never bypass sanitization without justification; never build templates from user input (→ security-a11y-errors doc).

---

## 4. Quick Reference — DO vs DON'T

| ✅ DO | ❌ DON'T |
|---|---|
| `signal()`, `computed()`, `linkedSignal()` | `BehaviorSubject` for simple component/service state |
| `input()`, `input.required()`, `output()`, `model()` | `@Input()`, `@Output()` decorators |
| `viewChild()`, `contentChildren()` | `@ViewChild`, `@ContentChildren` decorators |
| `host: { '(click)': 'save()' }` | `@HostBinding`, `@HostListener` |
| `@if` / `@for (...; track item.id)` / `@switch` | `*ngIf` / `*ngFor` / `*ngSwitch` |
| `@default never(expr)` for exhaustive switches `[v22]` | Silent fall-through `@default` on closed unions |
| `[class.active]="isActive()"` | `[ngClass]="{...}"` |
| `inject(HttpClient)` | `constructor(private http: HttpClient)` |
| `@Service()` `[v22]` | `@Injectable()` without `providedIn` |
| `httpResource(() => url)` for reads | Manual subscribe + loading/error flags |
| `HttpClient` / `httpMutation` for writes | `httpResource` for POST/PUT/DELETE mutations |
| Signal Forms (`form()`, `[formField]`) for new forms | Template-driven forms; new Reactive-Forms code without reason |
| `provideHttpClient()` `[v22]` | `withFetch()` (deprecated in v22) |
| `provideClientHydration(withEventReplay())` `[v22]` | `withIncrementalHydration()` (automatic in v22) |
| `debounced(sig, 300)` `[v22]` | toObservable → debounceTime → toSignal chains |
| `await fixture.whenStable()` in tests | Relying on Zone.js-era `fixture.detectChanges()` timing |
| Effects only for non-reactive sinks | Business logic, navigation, or state copies in `effect()` |
| Files: `flight-search.ts` + `FlightSearch` class | `flight-search.component.ts` + `FlightSearchComponent` |
| Style file only when component-specific styles exist | Generating empty `.scss` for every component |
| Design-system classes/tokens for common styling | Re-declaring buttons/cards/colors per component |
| Translation keys (`'CONTACT.FORM.SUBMIT' \| translate` or `$localize`) | Hardcoded strings or `TEXT_CONSTANTS` objects in TS |
| Feature folders by domain | Type folders (`components/`, `services/`) |
| `unknown` + narrowing | `any` |

---

## 5. Migration Checklist — Older Angular → 22

Run `ng update @angular/cli @angular/core` first; the bundled schematics handle most flips (it inserts `withXhr()` / `withNoIncrementalHydration()` where old behavior is relied on). Then, when touching code:

- [ ] Remove `standalone: true`; remove all NgModules where feasible
- [ ] `@Input()/@Output()` → `input()/output()`; two-way pairs → `model()`
- [ ] Decorator queries → signal queries
- [ ] `@HostBinding/@HostListener` → `host: {}`
- [ ] `*ngIf/*ngFor/*ngSwitch` → `@if/@for/@switch`; `ngClass/ngStyle` → class/style bindings
- [ ] Constructor injection → `inject()`
- [ ] `@Injectable({ providedIn: 'root' })` → `@Service()` `[v22]`
- [ ] `withFetch()` → remove (default now); keep XHR only via `withXhr()` if upload progress is needed
- [ ] `reportProgress` → `reportUploadProgress` / `reportDownloadProgress`
- [ ] `withIncrementalHydration()` → remove (default now)
- [ ] Simple `BehaviorSubject` state → signals; manual fetch state → resources
- [ ] `disabled(path, fn)` positional form `[≤v21]` → `disabled(path, { when: fn })` `[v22]`
- [ ] Jasmine/Karma → Vitest; `fixture.detectChanges()` patterns → `await fixture.whenStable()`
- [ ] Rename `*.component.ts` / `*Component` on touched files per current style guide (do not mass-rename unrelated files unless asked)

---

## 6. Output Contract for AI Agents

When generating Angular code:

1. **Match the project.** Inspect neighboring files for prefix, naming, and structure conventions before creating anything. Consistency within a file/project beats this guide on pure style questions.
2. **Place files correctly** per the architecture guide (`src/app/domains/<domain>/<layer>/…`). Never invent top-level type folders.
3. **Emit complete, compiling units** — component + template (+ test when asked), with all imports listed in the `imports` array.
4. **No dead patterns.** If you are about to write `NgModule`, `*ngIf`, `@Input()`, `constructor(private …)`, `any`, or `subscribe()` for simple state — stop and use the modern equivalent.
5. **State assumptions.** If the Angular version is ambiguous, assume 22 and say so.
