# Angular 22 — Routing, Navigation & App Initialization

> Part of the Angular 22 Best Practices set. Load for route configuration, lazy loading, guards/resolvers, route params, initializers, and HTTP interceptors.

---

## 1. Router Setup

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),                 // route params → signal inputs (always enable)
      withPreloading(PreloadAllModules),           // optional: preload lazy routes after start
      // withExperimentalAutoCleanupInjectors(),   // [v21.1, experimental] destroy route providers on leave
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
  ],
};
```

## 2. Route Configuration & Lazy Loading

Routes live next to their feature (`<domain>/<feature>/…routes.ts`) and are the feature's **public API** (see architecture guide). The shell only ever lazy-loads route arrays or components.

```typescript
// app.routes.ts (shell)
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  {
    path: 'flights',
    loadChildren: () => import('./domains/ticketing/feature-booking/booking.routes')
      .then(m => m.bookingRoutes),                        // lazy: whole feature
    canActivate: [authGuard],
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about').then(m => m.About),  // lazy: single component
  },
  { path: '**', component: NotFound },
];
```

- **Every feature route is lazy** (`loadChildren` for route arrays, `loadComponent` for leaves). Eager routes are the exception (shell, home).
- Child routes for shared layout/navigation within a feature; the parent renders `<router-outlet />`.
- Verify lazy loading in DevTools (separate chunk on first navigation). Counteract the first-click delay with preloading (`PreloadAllModules` or a custom strategy) or `@defer`-style UX.
- Use `PathLocationStrategy` (default). Hash routing only for static-file hosting that can't rewrite URLs.

## 3. Route Parameters as Signal Inputs

With `withComponentInputBinding()`, params, query params, and data resolve into signal inputs:

```typescript
// route: { path: 'flight/:id', loadComponent: ... }
export class FlightDetail {
  readonly id = input.required<string>();          // ← ':id' bound automatically

  protected readonly flightResource = httpResource<Flight>(
    () => `${base}/flight/${this.id()}`,           // re-fetches reactively on param change
  );
}
```

- Prefer this over injecting `ActivatedRoute`. Same component instance is **reused** when only params change — signal inputs handle that correctly by design; imperative `ngOnInit` reads do not.
- Query params: navigate with `[queryParams]="{ q: query() }"` / `router.navigate([...], { queryParams })`; bind them via inputs the same way.

## 4. Navigation

```html
<a [routerLink]="['/flight', flight.id]" routerLinkActive="active">Details</a>
```

```typescript
private readonly router = inject(Router);
this.router.navigate(['/flights'], { queryParams: { from: this.from() } });
```

- Template navigation via `routerLink` (never raw `href` for internal routes); programmatic via `Router`. `routerLinkActive` (or `isActive`) for active styling.
- Never navigate from inside an `effect()`.

## 5. Guards & Resolvers (Functional Only)

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);
};

export const unsavedChangesGuard: CanDeactivateFn<FlightEdit> = (component) =>
  component.hasUnsavedChanges() ? confirm('Discard changes?') : true;

export const flightResolver: ResolveFn<Flight> = (route) =>
  inject(FlightClient).getById(route.paramMap.get('id')!);
```

- Class-based guards/resolvers are legacy. Return `boolean | UrlTree | Promise | Observable`.
- Prefer returning a `UrlTree` over imperative `router.navigate` inside guards.
- **Prefer resources over resolvers** for data: resolvers block navigation until data arrives (worse UX); a `httpResource` in the target component renders the route immediately with loading state. Use resolvers only when the route truly must not render without the data.
- `CanDeactivate` for unsaved-changes protection; pair with Signal Forms' `dirty()` state.

## 6. Initializers

| Hook | Use for |
|---|---|
| `provideAppInitializer(() => …)` | App-wide startup work before first render (load config, restore session). May return a Promise — keep it fast; it blocks bootstrap. |
| `provideEnvironmentInitializer(() => …)` | Per-environment-injector setup — runs when a lazy route's environment is created (feature-level init). |
| Platform initializers | Rare; multi-app pages. |

Inside initializers, `inject()` works. Don't fetch non-critical data here — use resources after render instead.

## 7. HTTP Interceptors (Functional)

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).token();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
```

- Register via `provideHttpClient(withInterceptors([...]))`. Class interceptors are legacy.
- Typical chain: auth header → correlation id → error mapping/retry → (dev) logging. Keep each interceptor single-purpose; order matters.
- Remember `[v22]`: HttpClient runs on the Fetch backend by default — interceptors are unaffected, but upload-progress use cases need `withXhr()`.

## 8. Router Events

Subscribe to `inject(Router).events` (filtered, e.g. `NavigationEnd`) only for cross-cutting concerns (analytics, progress bar, scroll restoration). Feature logic should react to **inputs**, not router events.
