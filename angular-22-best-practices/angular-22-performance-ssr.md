# Angular 22 — Performance, Zoneless & SSR/Hydration

> Part of the Angular 22 Best Practices set. Load for performance work, change-detection questions, `@defer`, SSR, and hydration. Key v22 facts: incremental hydration is **on by default**; HttpClient uses the **Fetch backend by default**; OnPush is the **default CD strategy**.

---

## 1. Zoneless Change Detection (The Baseline)

New Angular apps are **zoneless** — no Zone.js (default since v21). Change detection runs only when Angular is explicitly notified:

- a signal read in a template changes,
- a component `input()` changes,
- a template-bound event listener fires,
- `AsyncPipe` receives a value,
- a host/template binding source changes,
- explicit `ChangeDetectorRef.markForCheck()` (escape hatch — treat as a smell).

Consequences:
1. `setTimeout`, `fetch`, websockets, third-party callbacks do **not** trigger UI updates by themselves. Route their results into **signals** (or resources) and the UI updates correctly.
2. All components use `OnPush` (default in v22; still write it explicitly).
3. All state that templates read must be signals (or async-piped observables).
4. Tests: `await fixture.whenStable()` instead of relying on Zone-driven `detectChanges()` timing (→ testing doc).

Legacy apps that still need Zone.js add it explicitly: `provideZoneChangeDetection({ eventCoalescing: true })` + the zone polyfill. Plan migration: make everything OnPush + signals, run the CLI MCP `onpush_zoneless_migration` analysis, then drop Zone.js. Avoid "zone pollution" advice (`runOutsideAngular`) in zoneless apps — it is obsolete there; it only matters while Zone.js is present.

## 2. Runtime Performance Rules

- **Slow computations**: keep templates and `computed()` bodies cheap; memoize via `computed` instead of method calls in templates; use pure pipes for repeated formatting. Profile before optimizing (Chrome DevTools performance panel has an Angular track; Angular DevTools shows CD profiling).
- **Skipping subtrees** happens automatically with OnPush + immutable signal updates — mutation in place is what breaks it.
- `@for` must track a stable id; bad tracking causes full list re-renders and state loss.
- Defer expensive, below-the-fold, or rarely-used UI with `@defer` (triggers: `viewport`, `interaction`, `hover`, `idle`, `timer`, `when`; add `prefetch on idle` for snappy reveal).
- Virtualize long lists (CDK virtual scroll) rather than rendering thousands of rows.

## 3. Bundle & Load Performance

- Lazy-load every feature route (`loadChildren`/`loadComponent`) — the single biggest lever.
- Import Angular Material components **directly** (`MatButton`), not via `Mat*Module`.
- `NgOptimizedImage` for all static images; `priority` on the LCP image; correct `width/height` to avoid CLS.
- Budgets: keep initial bundle small (set `budgets` in `angular.json`; ~200 KB initial is a sane target). Analyze with `ng build --stats-json` + `esbuild`-compatible analyzers (e.g. `source-map-explorer`).
- Heavy rarely-used services: `injectAsync` `[v22]` (→ di-services-state doc).
- Fonts/icons: subset and preload; avoid icon-font megapacks.

## 4. SSR & Hybrid Rendering

Add SSR with `ng add @angular/ssr` (or at `ng new`). Configure:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),                       // [v22] Fetch backend is default — no withFetch()
    provideClientHydration(withEventReplay()), // [v22] incremental hydration auto-enabled
  ],
};
```

- `[v22]` `withFetch()` is deprecated (Fetch is default). If you need upload progress (`reportUploadProgress`), opt back into XHR with `withXhr()`. Prefer `reportDownloadProgress`/`reportUploadProgress` over deprecated `reportProgress`.
- **Event replay** (`withEventReplay()`): user interactions before hydration are recorded and replayed after — keep it on.
- Hybrid routing: per-route render modes (server, client, prerender) via the server routes config; prerender parameterized routes by supplying `getPrerenderParams`. Access the HTTP request/response via the SSR request tokens when needed.

## 5. Incremental Hydration `[v22: default]`

`provideClientHydration()` now enables incremental hydration automatically; `withIncrementalHydration()` is gone from new code, `withNoIncrementalHydration()` opts out. Mark regions with `@defer` + `hydrate` clauses:

```html
@defer (on hover; hydrate on hover) {
  <app-car-pane />
} @placeholder { <app-placeholder /> }
```

Hydrate triggers: `hydrate on idle | viewport | interaction | hover | immediate | timer(500ms)`, `hydrate when (cond)`, and `hydrate never` (region stays static forever, nested `@defer` included). Until hydration, the **server-rendered markup** serves as the placeholder — users see real content immediately.

Notes:
- `hydrate` affects only the initial server-rendered page; client-side navigations render normally.
- Server and client markup must match. For DOM-manipulating third-party components, opt out with `ngSkipHydration` on the host element (last resort).
- Different server/client implementations: prefer DI (`provide` different services per platform) over scattering `isPlatformBrowser` checks; check the platform at runtime only at true boundaries.

## 6. Performance Checklist

- [ ] Zoneless, OnPush everywhere, all template state is signals
- [ ] Every feature route lazy; preloading strategy chosen deliberately
- [ ] `@defer` on heavy/below-fold UI; `hydrate` triggers tuned on SSR pages
- [ ] `track` correct in every `@for`; immutable updates everywhere
- [ ] `NgOptimizedImage` + `priority` LCP image
- [ ] Direct Material imports; bundle budgets enforced in CI
- [ ] SSR: `provideClientHydration(withEventReplay())`; no `withFetch()` `[v22]`
- [ ] Measured with Lighthouse (target 90+) and Angular DevTools before/after changes
