# Angular 22 — Signals, Reactivity & Data Access

> Part of the Angular 22 Best Practices set. Load for state management primitives, derived state, effects, async data (resources), and RxJS interop. `resource`, `httpResource`, and `rxResource` are **stable since v22**.

---

## 1. Primitive Selection Table

| Need | Use | Writable |
|---|---|---|
| Local mutable state | `signal()` | yes |
| Pure derivation from other signals | `computed()` | no |
| Derived but user-overridable; resets when source changes | `linkedSignal()` | yes |
| Time-lagged copy of a signal (e.g., search-as-you-type) | `debounced()` `[v22]` | no (resource) |
| Async data keyed by signals — HTTP GET | `httpResource()` | value locally settable |
| Async data — Observable-based source | `rxResource()` | value locally settable |
| Async data — Promise-based / arbitrary | `resource()` | value locally settable |
| Side effect into a non-reactive API | `effect()` | n/a |
| Writes/mutations (POST/PUT/DELETE) | `HttpClient` or `httpMutation` (→ di-services-state doc) | n/a |

**Decision rule:** if you are about to write an `effect()` that calls `.set()` on another signal — stop. Use `computed()` or `linkedSignal()` instead.

## 2. signal / computed / linkedSignal

```typescript
const count = signal(0);
count.set(5);
count.update(c => c + 1);

const doubled = computed(() => count() * 2);     // lazy, memoized, glitch-free

// linkedSignal: derived default + manual override; resets when source changes
const options = signal(['Ground', 'Air', 'Sea']);
const selected = linkedSignal(() => options()[0]);
selected.set('Sea');          // user override
options.set(['Email']);       // selected resets to 'Email'

// linkedSignal with previous value — preserve a still-valid selection
const selectedOption = linkedSignal<ShippingMethod[], ShippingMethod>({
  source: shippingOptions,
  computation: (next, prev) => next.find(o => o.id === prev?.value.id) ?? next[0],
});
```

### Immutability & equality
- Update immutably: `users.update(list => [...list, u])`. There is no `mutate()`.
- Signals compare by reference (`Object.is`) by default; in-place mutation will not notify consumers. Pass a custom `equal` function only when you have a measured reason.
- Treat signal values as deeply immutable. This also makes `OnPush`/zoneless correct by construction.

### Glitch-free guarantee
Consumers (templates, effects, computeds) never observe inconsistent intermediate states. When several source signals change synchronously, dependents recompute once with the final values. Rely on this — do not "batch" manually.

## 3. Effects — The Rules

Effects are for pushing reactive state **out** into non-reactive systems: canvas/chart rendering, `localStorage`, logging, analytics, third-party widgets.

```typescript
effect(() => {
  localStorage.setItem('theme', this.theme());
});
```

**Never in effects:**
- Business logic / server mutations. Reason: auto-tracking tracks **every** signal read anywhere in the call chain — if `executeLogic()` internally reads `isLoading` or `userId`, your "criteria effect" reruns on those too, with potentially destructive consequences. Effects also do not handle race conditions; overlapping async calls can interleave. Use resources/mutations instead.
- Copying state between signals (use `computed`/`linkedSignal`).
- Navigation or other app-flow control.

**Auto-tracking gotchas:**
- Every signal read during the effect run is tracked — including reads inside called methods. Reviewers can't see dependencies; keep effect bodies small and direct.
- Conditional reads untrack: in `if (isDelayed()) { console.log(delay()); }`, `delay` is untracked while `isDelayed()` is false. If you always want both tracked, read all signals at the top of the effect body, then branch on the captured values.
- `untracked(() => …)` excludes reads from tracking ("explicit effects"). This pattern is controversial: it fixes over-tracking but hides dataflow, invites cycles, and still doesn't solve races. Prefer restructuring (computed/resource) over `untracked`-heavy effects.
- Effects auto-dispose with their injection context (component/service). Create them in field initializers or constructors; pass an `Injector` only when creating outside an injection context.

## 4. Resources — Async Projection of Signals

A resource asynchronously projects input signals to output signals and exposes uniform status: `value()`, `status()`, `error()`, `isLoading()`, `hasValue()`, plus `reload()` and local `value.set()` for optimistic updates. All resources handle race conditions: only the latest request's result is applied; `httpResource`/`rxResource` cancel obsolete requests, `resource` ignores stale results.

### httpResource — default for HTTP reads

```typescript
import { httpResource } from '@angular/common/http';

protected readonly flightsResource = httpResource<Flight[]>(
  () => {
    if (!this.from() || !this.to()) return undefined;   // undefined ⇒ idle, no request
    return {
      url: `${this.baseUrl}/flight`,
      params: { from: this.from(), to: this.to() },
    };
  },
  { defaultValue: [], parse: FlightArrayZodSchema.parse },  // optional runtime validation
);
```

```html
@if (flightsResource.isLoading()) { <app-spinner /> }
@else if (flightsResource.hasValue()) {
  @for (f of flightsResource.value(); track f.id) { … }
}
@else if (flightsResource.error()) {
  <p>Failed. <button (click)="flightsResource.reload()">Retry</button></p>
}
```

- Returning `undefined` from the request function suspends the resource — the standard "don't fetch yet" idiom.
- `parse` accepts e.g. a Zod/Standard-Schema `parse` for runtime validation at the trust boundary. Use it for external APIs.
- Variants: `httpResource.text()`, `.blob()`, `.arrayBuffer()`.
- **Reads only.** Never use httpResource for POST/PUT/DELETE side effects — request functions may re-execute. Mutations → `HttpClient` / `httpMutation`.

### resource (Promise-based) & rxResource

```typescript
protected readonly flightsResource = resource({
  params: () => ({ from: this.from(), to: this.to() }),
  loader: ({ params, abortSignal }) => this.findPromise(params.from, params.to, abortSignal),
  defaultValue: [],
});
```

- Honor `abortSignal` in the loader so superseded requests are truly cancelled (it's the browser `AbortSignal`, unrelated to Angular signals).
- `rxResource` (from `@angular/core/rxjs-interop`) takes a `stream` returning an Observable — use when the source is inherently Observable (websocket-ish streams, complex RxJS pipelines).
- Composing resources: derive follow-up params from another resource's value via `computed`; for one-shot coordination, resource **snapshots** (`resource.snapshot…`, see book ch. 3) let you combine current statuses without effects.

### Where resources live
Expose resource **factories** from data-layer services so components/stores stay thin:

```typescript
@Service()
export class FlightClient {
  private readonly baseUrl = inject(ConfigService).baseUrl;
  findResource(from: Signal<string>, to: Signal<string>) {
    return httpResource<Flight[]>(() =>
      !from() || !to() ? undefined : { url: `${this.baseUrl}/flight`, params: { from: from(), to: to() } },
    );
  }
}
```

## 5. Debouncing `[v22]`

```typescript
import { debounced } from '@angular/core';

const filter = signal('');
const debouncedFilter = debounced(filter, 300);          // resource: value lags 300 ms
const flights = httpResource<Flight[]>(() =>
  debouncedFilter.hasValue() ? `${base}/flight?q=${debouncedFilter.value()}` : undefined,
);
```

For debouncing **form validation**, prefer `debounce()` from `@angular/forms/signals` (per-field, schema-level → forms doc).

## 6. RxJS Interop

Signals are the default; RxJS remains the right tool for genuinely event-stream-shaped problems (complex async orchestration, multiplexed sockets).

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

readonly user = toSignal(this.auth.user$, { initialValue: null });  // Observable → Signal
readonly query$ = toObservable(this.query);                          // Signal → Observable
```

- Never `subscribe()` manually in components for state; use `toSignal`, resources, or the `async` pipe.
- If you must subscribe in a service, manage teardown with `takeUntilDestroyed()`.

## 7. Thinking in the Signal Graph

Model a feature as a directed graph: user inputs → `signal`s → `computed`/`linkedSignal` derivations → resources at async boundaries → template reads. Data flows one way; events flow back as method calls that `set`/`update` source signals. If you can't draw the feature this way, the design is wrong — usually an `effect` is masquerading as dataflow.
