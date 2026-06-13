# ADR-004: Fate of the Performance & State Service Suite

- **Status:** Proposed (DECIDE items require owner choice; becomes *Accepted* when recorded)
- **Date:** 2026-06-13
- **Deciders:** Lubomir (owner), Claude (analysis)
- **Depends on:** ADR-001 (target structure), ADR-002 (cleanup precedent), ADR-003 (`performance-monitor` deferred here)
- **Scope:** `shared/services/{performance,bundle-analyzer,cache,image-optimization,signal-state}.service.ts`, `shared/strategies/preloading.strategy.ts`, and their `app.config.ts` provider registrations. Resolves the `performance-monitor` row deferred from ADR-003.

---

## Context

`app.config.ts` registers six infrastructure providers at root: `PerformanceService`, `BundleAnalyzerService`, `CacheService`, `ImageOptimizationService`, `CustomPreloadingStrategy`, `SignalStateService`. The Phase 0 map flagged several as registered-but-unconsumed; a direct consumer-graph check (grep for each injection across all components, excluding the service files themselves) settles it.

### Verified consumer graph

| Service | Real consumers (verified) | Notes |
|---|---|---|
| `CustomPreloadingStrategy` | the router, via `withPreloading(...)` in `app.config.ts` | **Genuinely wired and doing work.** |
| `PerformanceService` | `performance-monitor.component.ts` only | That component is unmounted and ADR-003-deferred. |
| `BundleAnalyzerService` | `performance-monitor.component.ts` only | Self-admits simulation: source comment *"we'll simulate the analysis with performance API data"*. |
| `CacheService` | `performance-monitor.component.ts` only | Configures service-worker cache strategies, but **no service worker exists** (no `ngsw-config.json`, no `serviceWorker` in `app.config.ts`/`angular.json`). |
| `ImageOptimizationService` | **none** | Zero injectors anywhere. |
| `SignalStateService` | **none** | Zero injectors. Re-implements CV state (experiences/projects/skills as `any[]`, plus a `totalExperienceYears` duplicate of `CvDataService`'s logic) that nothing reads. |

So of six providers, **one is real** (`CustomPreloadingStrategy`), three are alive only through a single unmounted dashboard (`Performance`, `BundleAnalyzer`, `Cache`), and two are pure dead code (`ImageOptimization`, `SignalState`).

### The shape of the problem

This is the most elaborate speculation in the codebase: a performance-engineering toolkit (Core Web Vitals scoring, bundle budgets, multi-strategy caching, responsive-image pipelines) built for an application whose runtime is a static, no-backend, single-bundle CV site. Several services *measure or optimize things that don't exist here* — bundle analysis that's simulated, cache strategies with no service worker, an `/api/` cache rule with no API. The same YAGNI verdict as ADR-002 applies, with one important exception (`CustomPreloadingStrategy`) and one genuinely useful idea worth rescuing (`ImageOptimizationService`'s WebP/responsive logic, *if* you actually serve optimized images).

---

## Decision

### Inventory

| Item | Verdict | Rationale |
|---|---|---|
| `CustomPreloadingStrategy` | **KEEP, relocate** → `shared/util-performance/` | The one service doing real work. Reads route `data.priority`/`preload` flags and delays preloads on slow connections — legitimate for a multi-route lazy-loaded app. Minor cleanup: it `console.log`s on every preload; remove or gate behind a dev flag. |
| `SignalStateService` (+ its half of `shared/models/signal-models.ts`) | **DELETE** | Zero consumers; duplicates `CvDataService` state with weaker `any[]` typing. A parallel state container nothing reads is strictly worse than no container. Confirms ADR-002's cascade note. |
| `ImageOptimizationService` | **DECIDE** | Zero consumers today, but the WebP-detection + responsive-URL logic is the one piece of genuine, reusable value in the suite. Option A *(recommended if images matter)*: keep, relocate to `shared/util-performance/`, and actually wire it into image rendering (the `lazy-image.directive.ts` is the natural integration point). Option B: delete now; reintroduce against a real need later. Keeping it unwired in `shared/` is the wrong answer. |
| `PerformanceService` | **DECIDE** | Core Web Vitals monitoring. Only consumer is the unmounted monitor. Option A: keep as a small dev-only diagnostics tool, mounted on a `lab` route with `performance-monitor` (see below). Option B *(recommended)*: delete — real CWV data is better obtained from Lighthouse/PageSpeed (you already have a `performance:lighthouse` npm script) than from a hand-rolled in-app collector that adds bundle weight to every visitor. |
| `BundleAnalyzerService` | **DELETE** | Self-admittedly simulated; real bundle analysis is the `analyze:bundle` npm script (`webpack-bundle-analyzer`) you already have. An in-app simulated analyzer is theatre — it reports numbers it makes up. |
| `CacheService` | **DELETE** | Configures service-worker caching for a service worker that doesn't exist, with an `/api/` strategy for an API that doesn't exist. If offline/PWA support is ever wanted, use Angular's official `@angular/service-worker` + `ngsw-config.json` — not a hand-rolled config object nothing reads. |
| `performance-monitor.component.ts` (from ADR-003) | **RESOLVED → DELETE** if `PerformanceService` is deleted (default); **or KEEP → lab** (after fixing the `setInterval` teardown leak with `DestroyRef`/`takeUntilDestroyed`) if `PerformanceService` is kept | Its fate follows `PerformanceService`. The interval leak is confirmed present and must be fixed if it survives. |

### Provider cleanup (`app.config.ts`)

After execution, the providers array drops to what's real: keep `provideRouter(routes, withPreloading(CustomPreloadingStrategy))` and `CustomPreloadingStrategy`; remove `PerformanceService`, `BundleAnalyzerService`, `CacheService`, `ImageOptimizationService`, `SignalStateService` (each subject to its verdict above). Several were registered as bare class providers — a small anti-pattern given they're already `providedIn: 'root'`, so the registrations are redundant even for the survivors.

### Recommended default resolution

If you want the smallest honest surface: **keep `CustomPreloadingStrategy`; delete `SignalState`, `BundleAnalyzer`, `Cache`, `Performance`, and `performance-monitor`; decide `ImageOptimization` by whether you'll wire it to `lazy-image.directive`.** Performance *measurement* moves entirely to your existing npm scripts (Lighthouse, bundle-analyzer), which is where it belongs — out of the shipped bundle.

---

## Considered alternatives

**A. Keep the whole suite "for when the site grows".** Rejected — textbook speculative generality; the suite measures and optimizes things this app doesn't have (bundles it simulates, caches with no SW, APIs with no backend), and ships that weight to every visitor.

**B. Keep the monitoring services but never mount the UI.** Rejected — root-provided services with one unmounted consumer are dead weight that looks alive. Either they're a real (lab) tool or they're gone.

**C. Build a real service worker / real bundle integration now.** Rejected as premature — that's a feature with its own ADR if/when offline support or measured perf problems justify it. Decisions here don't preclude it; they just stop pretending it exists.

---

## Consequences

**Positive:** `app.config.ts` shrinks to providers that do real work; the `shared` area loses ~4–5 services of simulated/dead infrastructure; performance measurement consolidates onto the npm scripts already in `package.json` (no per-visitor cost); the ADR-003 `performance-monitor` limbo is resolved; one confirmed interval leak is removed or fixed.

**Negative / costs:** if a genuine perf-monitoring or PWA need appears later, parts get rebuilt against a real requirement (accepted — YAGNI). Losing the in-app dashboard removes a "look, metrics!" demo; if that demo has portfolio value, the `lab` route (keep-`PerformanceService` path) preserves it honestly rather than shipping it site-wide.

**Deferred / related:** `shared/utils/interval-manager.ts` (built to manage `setInterval` teardown, currently unused) — if `performance-monitor` is deleted, confirm `interval-manager` has no other caller and sweep it in the ADR-002 knip pass.

## Compliance check

Done when: every inventory row is executed or re-verdicted; `app.config.ts` providers list contains only real providers; `knip` reports no unused exports among the surviving `util-performance` files; `CustomPreloadingStrategy` relocated and its `console.log` gated/removed; `performance-monitor` resolved consistently with `PerformanceService`; build + visual smoke pass; status *Accepted* with both DECIDE items (`ImageOptimization`, `Performance`) recorded.
