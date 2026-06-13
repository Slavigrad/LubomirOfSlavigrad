# Angular 22 — Dependency Injection, Services & State Management

> Part of the Angular 22 Best Practices set. Load for services, providers, injection scopes, lightweight signal stores, and NgRx SignalStore.

---

## 1. Declaring Services

```typescript
// [v22] canonical form
import { Service } from '@angular/core';

@Service()
export class FlightClient { /* ... */ }
```

- `@Service()` `[v22]` registers a root-scoped singleton. It is semantically identical to `@Injectable({ providedIn: 'root' })` — a writing-style change only. Use `@Service()` in v22 codebases; use the `@Injectable` form when the code must compile on ≤v21.
- Single responsibility per service. Data access (`*Client`), state (`*Store`), and cross-cutting utilities are separate services in separate layer folders (`data/`, `util/` — see architecture guide).
- Root singletons are tree-shakable: unused services don't ship.

## 2. Injection

```typescript
@Service()
export class FlightStore {
  private readonly client = inject(FlightClient);   // always inject() — never constructor params
  private readonly logger = inject(Logger, { optional: true });
}
```

- `inject()` only works in an **injection context**: field initializers, constructors, provider factories, guards/resolvers/interceptor functions. Outside of those, capture an `Injector` and use `runInInjectionContext` — or restructure.
- Order: injected dependencies at the top of the class, before inputs/outputs, before methods.

## 3. Lazy Service Injection — `injectAsync` `[v22]`

For services whose implementation pulls heavy bundles used rarely:

```typescript
import { injectAsync, onIdle } from '@angular/core';

private readonly upgradeService = injectAsync(
  () => import('../data/upgrade-service').then(m => m.UpgradeService),
  { on: onIdle(), prefetch: true },   // prefetch: load bundle early, instantiate on demand
);
// usage: (await this.upgradeService).startUpgradeFlow()
```

- The injected service must be auto-provided: `@Service()` (or `@Injectable({ providedIn: 'root' })` pre-v22).
- Use for genuinely heavy, rarely-used flows. Default remains plain `inject()`.

## 4. Providers & Scopes

| Scope | How | Lifetime |
|---|---|---|
| Application (singleton) | `@Service()` | app lifetime |
| Route subtree | `providers: [...]` on a route | app lifetime by default; destroyed on navigation away **iff** `withExperimentalAutoCleanupInjectors()` is configured `[v21.1, experimental]` |
| Component subtree | `providers: [...]` in `@Component` | component lifetime; one instance per component instance |

```typescript
// Route-local service shared across a feature's child routes
{ path: 'booking', component: BookingNavigation,
  providers: [{ provide: LanguageService, useClass: DefaultLanguageService }], children: [...] }
```

- Component-local providers are the right tool for tightly-coupled composites (e.g., `TabbedPane` + `Tab` sharing a coordination service) — each composite gets its own instance.
- Swap implementations via providers (`useClass`, `useValue`, `useFactory`, `useExisting`); expose configuration via `provideX()`-style provider functions rather than raw token arrays.
- Be aware that environment providers (route-level) are **not** destroyed by default — that is why Auto Cleanup exists; treat it as experimental.

## 5. Lightweight Signal Store (Hand-Rolled)

The default state pattern for a feature: a service exposing **read-only** signals and intention-named methods.

```typescript
@Service() // or component-/route-provided for narrower scope
export class FlightStore {
  private readonly client = inject(FlightClient);

  // private writable state
  private readonly _filter = signal({ from: 'Graz', to: 'Hamburg' });

  // public read-only API
  readonly filter = this._filter.asReadonly();
  readonly from = computed(() => this._filter().from);
  readonly to = computed(() => this._filter().to);
  readonly flightsResource = this.client.findResource(this.from, this.to);
  readonly flights = this.flightsResource.value;

  // intentions (commands) — the only way to change state
  updateFilter(from: string, to: string): void {
    this._filter.set({ from, to });
  }
}
```

Rules:
- **Unidirectional data flow:** UI events call intention methods → store updates signals → derived signals/resources recompute → UI re-renders. Never let consumers write store signals directly.
- **Granularity:** several small stores beat one god-store. Default to **feature-local** stores; promote to the domain's `data/` layer only when 2+ features need the same state (rule of three).
- **Store-to-store communication:** lower-layer/domain stores may be read by feature stores; avoid cycles; never have two stores own the same fact (single source of truth — derive, don't copy).
- **Delegated signals:** when a Signal Form must write through to a store, wrap store state in a delegated signal (a linkedSignal whose `set/update` forward to the store's intention method) instead of copying state. Not (yet) in the framework — implement locally (see *Modern Angular* ch. 5).

## 6. NgRx SignalStore (When Stores Grow)

Use `signalStore` when you want structured features (entities, devtools, events) without Redux boilerplate. It composes:

```typescript
export const FlightStore = signalStore(
  { providedIn: 'root' },
  withState({ filter: { from: 'Graz', to: 'Hamburg' }, basket: {} as Record<number, boolean> }),
  withProps(() => ({ _client: inject(FlightClient), _snackBar: inject(MatSnackBar) })),
  withComputed(({ filter }) => ({
    route: computed(() => `${filter.from()} → ${filter.to()}`),
  })),
  withResource((store) => store._client.findResource(store.filter.from, store.filter.to)),
  withMethods((store) => ({
    updateFilter(from: string, to: string) { patchState(store, { filter: { from, to } }); },
  })),
  withHooks({ onInit(store) { /* ... */ } }),
);
```

### Mutations (writes) — `withMutations` + `httpMutation`/`rxMutation`

```typescript
withMutations((store) => ({
  saveFlight: httpMutation<Flight, Flight>({
    request: (flight) => ({ url: `${base}/flight/${flight.id}`, method: 'PUT', body: flight }),
    operator: concatOp,
    onSuccess: (result, param) => store._snackBar.open('Flight updated', 'OK', { duration: 3000 }),
    onError:   (error,  param) => store._snackBar.open('Update failed', 'OK', { duration: 5000 }),
  }),
})),
```

- Generates `saveFlight(flight)` plus status signals `saveFlightIsPending`, `saveFlightError` automatically.
- **Concurrency operators** (mirror RxJS flattening):
  - `switchOp` — cancel previous; only latest matters (live search).
  - `mergeOp` — run all in parallel (independent fire-and-forget).
  - `concatOp` — queue in order (**default**; safe general choice).
  - `exhaustOp` — ignore while busy (double-submit protection).
- Keep HTTP details out of the store: let the data-layer client expose mutation factories (`createSaveMutation(options)`), mirroring resource factories.

### Reactive methods, entities, events
- `rxMethod` for Observable-driven pipelines; `signalMethod` for signal-driven ones — both manage subscription lifetime.
- `withEntities` for normalized collections (entity maps, ids); normalize relational data instead of nesting copies.
- The **Events API** (Flux/Redux-style: events → reducer → handlers, dispatching) is available when you need event-sourced traceability; for most apps, methods + mutations suffice.
- Wire Redux DevTools via `withDevtools(...)` (ngrx-toolkit) and disable it in production builds.

## 7. Choosing a State Approach

| Situation | Use |
|---|---|
| Component-local UI state | plain `signal`/`computed` in the component |
| Feature state, one feature | hand-rolled signal store, feature-local |
| Domain state shared by features | signal store or SignalStore in the domain `data/` layer |
| Many entities, optimistic updates, devtools, audit-style events | NgRx SignalStore (+ entities/mutations/events) |
| Server cache semantics dominate | resources first; store only what the server can't own |
