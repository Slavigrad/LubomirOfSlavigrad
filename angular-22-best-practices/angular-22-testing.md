# Angular 22 — Testing with Vitest

> Part of the Angular 22 Best Practices set. Load for writing or fixing tests. **Vitest is the CLI's default test runner.** All examples assume zoneless change detection.

---

## 1. Fundamentals

- Files end in `.spec.ts`, live **next to** the code under test (never a separate `tests/` tree).
- `describe` groups, `it` cases, Arrange–Act–Assert structure. `beforeEach` for shared setup. `it.skip`/`describe.skip` to disable; never delete failing tests to go green.
- Run: `ng test` (watch), `ng test --watch=false` (CI), coverage via `--coverage`.
- Browser Mode runs the same tests in real browsers (Playwright-driven) — enable for DOM-sensitive suites; Node + happy-dom/jsdom is fine for most unit tests.

## 2. Component Tests (Zoneless Pattern)

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FlightSearch } from './flight-search';

describe('FlightSearch', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightSearch],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('searches flights for the given route', async () => {
    const fixture = TestBed.createComponent(FlightSearch);
    await fixture.whenStable();                       // settle initial render (zoneless!)

    const ctrl = TestBed.inject(HttpTestingController);
    fixture.componentInstance.from.set('Graz');
    fixture.componentInstance.to.set('Hamburg');
    await fixture.whenStable();                       // let the resource fire

    const req = ctrl.expectOne(r => r.url.includes('/flight'));
    req.flush([{ id: 1, from: 'Graz', to: 'Hamburg' }]);
    await fixture.whenStable();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="flight-row"]');
    expect(rows.length).toBe(1);
    ctrl.verify();                                    // no outstanding requests
  });
});
```

Zoneless test rules:
- `await fixture.whenStable()` after creation and after every state change you expect to render. Do not depend on Zone.js-era timing of `detectChanges()`.
- Set **signals**, then await — don't poke private fields.
- Query the DOM via stable hooks (`data-testid`, roles, labels) — testing what the user sees — or via `fixture.debugElement` (`By.css`, `By.directive`) when you need component instances. Prefer user-visible locators.
- Setting signal **inputs**: `fixture.componentRef.setInput('flight', testFlight)`.

## 3. Mocking

```typescript
// Service mock at TestBed level
TestBed.configureTestingModule({
  imports: [FlightSearch],
  providers: [{ provide: FlightClient, useValue: { findResource: () => fakeResource } }],
});

// Override a component-local provider
TestBed.overrideComponent(FlightSearch, {
  add: { providers: [{ provide: FlightStore, useValue: storeMock }] },
});
```

- Vitest spies: `vi.fn()`, `vi.spyOn(service, 'save')` — assert calls with `toHaveBeenCalledWith`. Gray-box sparingly: over-asserting internals makes tests brittle; prefer asserting observable behavior.
- **Shallow testing**: replace heavy child components with stubs (same selector + inputs/outputs) via `overrideComponent`/test doubles when the child is irrelevant to the case.
- **HTTP**: always `provideHttpClientTesting()` + `HttpTestingController` (`expectOne`, `flush`, `flush(null, { status: 500, statusText: 'Server Error' })`, `verify()`). Never let unit tests hit the network. (`HttpClientTestingModule` is the legacy spelling.)
- **Routed components**: `provideRouter(testRoutes)` + `RouterTestingHarness` to navigate and grab the activated component.

## 4. Time, Debounce, Async

```typescript
it('debounces the search input', async () => {
  vi.useFakeTimers();
  // … type into input, then:
  await vi.advanceTimersByTimeAsync(300);
  await fixture.whenStable();
  // assert request fired exactly once
  vi.useRealTimers();
});
```

- Fake timers (`vi.useFakeTimers`, `advanceTimersByTimeAsync`) for `debounced()`/`debounce()` logic — never real `setTimeout` waits.
- Mock artificial delays at the service boundary instead of sleeping.
- Configure sane default timeouts in `vitest` config rather than per-test magic numbers.

## 5. Service & Store Tests

```typescript
it('updates the filter', () => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  const store = TestBed.inject(FlightStore);
  store.updateFilter('Graz', 'Hamburg');
  expect(store.filter()).toEqual({ from: 'Graz', to: 'Hamburg' });
});
```

- Instantiate via `TestBed.inject` so `inject()` works. Test the public signal API + intention methods; never reach into private writable signals.
- Pure logic (validators, transforms) → plain function tests without TestBed (fastest, most stable). Push logic out of components precisely so it's testable this way.

## 6. What to Test (Priority Order)

1. Domain logic: transforms, validators, store intention methods, computed derivations.
2. Component behavior: given inputs/state → rendered output; user events → emitted outputs/store calls; loading/error/empty branches of resources.
3. Form validation paths (Signal Forms: error kinds, disabled/hidden conditions, submit gating).
4. Guards, resolvers, interceptors (pure functions — easy wins).
5. Accessibility smoke: roles/labels present, keyboard handlers wired.

Avoid testing: framework behavior, template trivia (exact markup), private internals.

## 7. Remember

- `TestBed` **rethrows** `ErrorHandler` errors by default — a passing test means no swallowed exceptions. Opt out only deliberately (`rethrowApplicationErrors: false`).
- Track coverage as a trend (`--coverage`), don't chase 100%.
- Keep tests deterministic: no real time, no real network, no shared mutable module state.
