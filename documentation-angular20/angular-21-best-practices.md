# Angular 20+ Best Practices & Modern Patterns

> **Version**: 2.0 — February 2026
> **Covers**: Angular 20, 21+ (compatible with future versions)
> **Sources**: [angular.dev/ai](https://angular.dev/ai/develop-with-ai), [Angular Style Guide](https://angular.dev/style-guide), Angular v21 Release Notes
> **Purpose**: Universal rules file for AI agents, code reviews, learning, and migration from Angular 17/18/19 to Angular 20+

---

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

---

## Table of Contents

1. [TypeScript Best Practices](#1-typescript-best-practices)
2. [Angular Core Principles](#2-angular-core-principles)
3. [Components & Directives](#3-components--directives)
4. [Signals & Reactive State](#4-signals--reactive-state)
5. [Templates & Control Flow](#5-templates--control-flow)
6. [Services & Dependency Injection](#6-services--dependency-injection)
7. [Data Fetching — resource & httpResource](#7-data-fetching--resource--httpresource)
8. [Forms — Reactive & Signal Forms](#8-forms--reactive--signal-forms)
9. [Routing](#9-routing)
10. [Change Detection & Zoneless](#10-change-detection--zoneless)
11. [Accessibility](#11-accessibility)
12. [Performance](#12-performance)
13. [Project Structure & Naming](#13-project-structure--naming)
14. [Testing](#14-testing)
15. [Migration Checklist — Angular 17/18/19 → 20+](#15-migration-checklist--angular-171819--20)
16. [Quick Reference — DO vs DON'T](#16-quick-reference--do-vs-dont)

---

## 1. TypeScript Best Practices

- Use **strict type checking** (`"strict": true` in `tsconfig.json`).
- **Prefer type inference** when the type is obvious — avoid redundant type annotations.
- **Avoid the `any` type** — use `unknown` when the type is uncertain.
- Use `readonly` for properties that should not be reassigned after initialization.
- Prefer `interface` over `type` for object shapes (better error messages, extendability).
- Use `as const` for literal type inference where appropriate.
- Enable `useDefineForClassFields: true` in `tsconfig.json` for modern field semantics.

```typescript
// ✅ Type inference — no redundant annotation needed
const count = signal(0);
const name = signal('');

// ✅ Explicit typing when inference is insufficient
const users = signal<User[]>([]);

// ❌ NEVER use `any`
let data: any; // BAD
let data: unknown; // ✅ GOOD — forces type narrowing before use
```

---

## 2. Angular Core Principles

### Standalone Components Are the Default

- **Always use standalone components** — NgModules are legacy.
- **Must NOT set `standalone: true`** inside Angular decorators. It is the default in Angular v20+.

```typescript
// ✅ Correct — standalone is implicit in v20+
@Component({
  selector: 'app-dashboard',
  imports: [MatButtonModule, DatePipe],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard { }

// ❌ WRONG — redundant in Angular 20+
@Component({
  standalone: true, // DO NOT add this
})
```

### Key Rules

- Always set `changeDetection: ChangeDetectionStrategy.OnPush`.
- Use `imports: [...]` directly in the component decorator to declare dependencies.
- Prefer inline templates for small components (< ~15 lines of template).
- When using external templates/styles, use **paths relative to the component TS file**.

---

## 3. Components & Directives

### Signal-Based Inputs and Outputs

Use `input()` and `output()` functions — **not** `@Input()` / `@Output()` decorators.

```typescript
import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-candidate-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" (click)="handleSelect()">
      <h3>{{ candidate().name }}</h3>
      <span>{{ initials() }}</span>
    </div>
  `,
})
export class CandidateCard {
  // Required input
  readonly candidate = input.required<Candidate>();

  // Optional input with default
  readonly showDetails = input(false);

  // Output event
  readonly selected = output<string>();

  // Derived state from inputs
  protected readonly initials = computed(() => {
    const name = this.candidate().name;
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  });

  protected handleSelect(): void {
    this.selected.emit(this.candidate().id);
  }
}
```

### Two-Way Binding with `model()`

Use `model()` for two-way data binding signals — replaces `@Input() + @Output()` combos.

```typescript
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `<button (click)="checked.set(!checked())">{{ checked() ? 'ON' : 'OFF' }}</button>`,
})
export class Toggle {
  readonly checked = model(false);
}

// Parent usage:
// <app-toggle [(checked)]="isEnabled" />
```

### Host Bindings

Use the `host` object in the decorator — **never** use `@HostBinding` / `@HostListener`.

```typescript
// ✅ CORRECT
@Component({
  selector: 'app-button',
  host: {
    '[class.active]': 'isActive()',
    '[attr.aria-pressed]': 'isActive()',
    '(click)': 'handleClick()',
    '(keydown.enter)': 'handleClick()',
  },
})
export class AppButton {
  readonly isActive = signal(false);
  protected handleClick() { this.isActive.update(v => !v); }
}

// ❌ WRONG — deprecated pattern
@HostBinding('class.active') isActive = false;
@HostListener('click') onClick() { }
```

### Access Modifiers

- Use `protected` for members accessed **only** in the component's template.
- Use `readonly` for properties initialized by `input()`, `model()`, `output()`, and queries.
- Use `private` for internal methods/helpers not accessed from the template.

```typescript
@Component({ template: `<p>{{ fullName() }}</p>` })
export class UserProfile {
  readonly firstName = input<string>();
  readonly lastName = input<string>();

  // Template-only — use protected
  protected readonly fullName = computed(() =>
    `${this.firstName()} ${this.lastName()}`
  );

  // Internal logic — use private
  private formatName(name: string): string { return name.trim(); }
}
```

### Signal-Based Queries

Replace `@ViewChild` / `@ContentChild` decorators with signal query functions.

```typescript
import { viewChild, viewChildren, contentChild, contentChildren, ElementRef } from '@angular/core';

@Component({ /* ... */ })
export class SearchPage {
  // Single element query
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // Required query (throws if not found)
  private readonly sortHeader = viewChild.required(MatSort);

  // Multiple elements
  private readonly cards = viewChildren(CandidateCard);

  // Projected content queries
  private readonly projectedHeader = contentChild('header');
  private readonly projectedItems = contentChildren(MenuItem);
}
```

---

## 4. Signals & Reactive State

### Core Signal Primitives

| API | Purpose | Writable? |
|-----|---------|-----------|
| `signal()` | Local mutable state | ✅ Yes |
| `computed()` | Derived read-only state | ❌ No |
| `linkedSignal()` | Writable state derived from other signals — resets when source changes | ✅ Yes |
| `effect()` | Side effects for non-reactive APIs (DOM, logging, localStorage) | N/A |
| `resource()` | Async data with signal-based params | Read + local update |
| `httpResource()` | HTTP data fetching built on resource + HttpClient | Read + local update |

### signal, computed, linkedSignal

```typescript
import { signal, computed, linkedSignal } from '@angular/core';

// Writable signal
const count = signal(0);
count.set(5);
count.update(c => c + 1);

// Derived read-only signal
const doubled = computed(() => count() * 2);

// Writable signal linked to another signal
// Resets when source changes, but can be manually overridden
const options = signal(['Ground', 'Air', 'Sea']);
const selected = linkedSignal(() => options()[0]);

selected.set('Sea');       // Manual override ✅
options.set(['Email']);     // `selected` resets to 'Email'
```

### linkedSignal with Previous Value

```typescript
const shippingOptions = signal<ShippingMethod[]>([
  { id: 0, name: 'Ground' },
  { id: 1, name: 'Air' },
]);

const selectedOption = linkedSignal<ShippingMethod[], ShippingMethod>({
  source: this.shippingOptions,
  computation: (newOptions, previous) => {
    // Preserve user's selection if it still exists
    return newOptions.find(opt => opt.id === previous?.value.id) ?? newOptions[0];
  },
});
```

### Signal Update Rules

```typescript
const users = signal<User[]>([]);

// ✅ CORRECT — immutable updates
users.update(list => [...list, newUser]);
users.set([...users(), newUser]);

// ❌ WRONG — NEVER use mutate (removed/deprecated)
users.mutate(list => list.push(newUser)); // DO NOT USE
```

### Effects — Use Sparingly

Effects are the **last resort**. Prefer `computed()` for derived values and `linkedSignal()` for values that can be both derived and manually set.

```typescript
import { effect } from '@angular/core';

// ✅ Appropriate — syncing to non-reactive API (DOM, localStorage)
effect(() => {
  localStorage.setItem('theme', this.theme());
});

effect(() => {
  this.chart.nativeElement.update(this.chartData());
});

// ❌ WRONG — copying signal data with effect
// If you find yourself copying data between signals with an effect,
// use computed() or linkedSignal() instead.
effect(() => {
  this.derivedValue.set(this.sourceValue() * 2); // BAD — use computed()
});
```

### RxJS Interop

When you need to bridge between Observables and Signals:

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

// Observable → Signal
const user = toSignal(this.userService.currentUser$, { initialValue: null });

// Signal → Observable
const searchTerm$ = toObservable(this.searchQuery);
```

---

## 5. Templates & Control Flow

### Use Native Control Flow (NOT structural directives)

```html
<!-- ✅ CORRECT — Native control flow (Angular 17+) -->
@if (loading()) {
  <app-spinner />
} @else if (hasResults()) {
  <app-results [data]="results()" />
} @else {
  <app-empty-state />
}

@for (candidate of candidates(); track candidate.id) {
  <app-candidate-card [candidate]="candidate" />
} @empty {
  <p>No candidates found.</p>
}

@switch (status()) {
  @case ('active')   { <span class="badge-active">Active</span> }
  @case ('inactive') { <span class="badge-inactive">Inactive</span> }
  @default           { <span>Unknown</span> }
}

<!-- ❌ WRONG — legacy structural directives -->
<app-spinner *ngIf="loading" />
<div *ngFor="let c of candidates" />
<div [ngSwitch]="status" />
```

### Deferred Loading with `@defer`

```html
<!-- Lazy load on user interaction -->
@defer (on interaction) {
  <app-advanced-options />
} @placeholder {
  <button>Show Advanced Options</button>
} @loading (minimum 100ms) {
  <app-skeleton-loader />
}

<!-- Lazy load when element enters viewport -->
@defer (on viewport; prefetch on idle) {
  <app-heavy-chart [data]="chartData()" />
} @placeholder {
  <div class="chart-placeholder">Chart loading...</div>
}

<!-- Lazy load after a timer -->
@defer (on timer(3s)) {
  <app-recommendations />
}
```

### Template Rules

- Keep templates **simple** — move complex logic to `computed()` signals.
- Use the **async pipe** to handle observables in templates.
- Do **NOT** write arrow functions in templates (not supported).
- Do **NOT** write regular expressions in templates.
- Do **NOT** assume globals like `new Date()` are available in templates.
- Use `class` bindings, **NOT** `ngClass`.
- Use `style` bindings, **NOT** `ngStyle`.

```html
<!-- ✅ Class and style bindings -->
<div [class.active]="isActive()" [class.disabled]="isDisabled()">
<div [style.color]="textColor()" [style.font-size.px]="fontSize()">

<!-- Or with object syntax -->
<div [class]="{ active: isActive(), dense: density() === 'high' }">

<!-- ❌ WRONG — do not use ngClass / ngStyle -->
<div [ngClass]="{ active: isActive() }">
<div [ngStyle]="{ color: textColor() }">
```

### NgOptimizedImage

Use `NgOptimizedImage` for **all static images**. It does NOT work for inline base64 images.

```typescript
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  template: `
    <!-- LCP image — add priority -->
    <img ngSrc="/assets/hero.webp" width="1200" height="600" alt="Hero banner" priority>

    <!-- Non-critical image -->
    <img ngSrc="/assets/avatar.png" width="48" height="48" alt="User avatar">
  `,
})
```

---

## 6. Services & Dependency Injection

### Use `inject()` Function — Not Constructor Injection

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  // ❌ WRONG — constructor injection is the old pattern
  // constructor(private http: HttpClient) {}
}
```

### Service Design

- Design services around a **single responsibility**.
- Use `providedIn: 'root'` for singleton services.
- Keep components thin — move business logic into services.
- Expose read-only signals from services; keep writable signals private.

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  // Private writable signal
  private readonly _theme = signal<'light' | 'dark'>('light');

  // Public read-only signal
  readonly theme = this._theme.asReadonly();

  // Public derived state
  readonly isDark = computed(() => this._theme() === 'dark');

  // Controlled mutation
  toggleTheme(): void {
    this._theme.update(t => t === 'light' ? 'dark' : 'light');
  }
}
```

---

## 7. Data Fetching — resource & httpResource

### httpResource (Experimental — Angular 19.2+)

`httpResource` is a reactive wrapper around `HttpClient` that returns signals for value, status, error, and loading state. It is intended for **reading/fetching data**, not for writing data back to the server.

```typescript
import { httpResource } from '@angular/common/http';

@Component({ /* ... */ })
export class UserProfile {
  readonly userId = input.required<string>();

  // Reactive — automatically re-fetches when userId changes
  protected readonly userResource = httpResource<User>(
    () => `/api/users/${this.userId()}`
  );
}
```

**Template usage:**

```html
@if (userResource.isLoading()) {
  <app-spinner />
} @else if (userResource.hasValue()) {
  <h1>{{ userResource.value().name }}</h1>
} @else if (userResource.error()) {
  <p>Failed to load user. <button (click)="userResource.reload()">Retry</button></p>
}
```

**With request options:**

```typescript
protected readonly searchResource = httpResource<SearchResult[]>(() => ({
  url: '/api/search',
  method: 'POST',
  body: { query: this.searchQuery(), limit: this.pageSize() },
  headers: { 'X-Request-Id': crypto.randomUUID() },
}));
```

**With schema validation (Zod):**

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

protected readonly userResource = httpResource(() => `/api/users/${this.userId()}`, {
  parse: UserSchema.parse,
});
```

**Variants:** `httpResource.text()`, `httpResource.blob()`, `httpResource.arrayBuffer()`.

### resource (Generic Async — Angular 19+)

Use `resource()` for non-HTTP async operations or custom data sources.

```typescript
import { resource } from '@angular/core';

protected readonly dataResource = resource({
  params: () => ({ id: this.selectedId() }),
  loader: async ({ params, abortSignal }) => {
    const response = await fetch(`/api/data/${params.id}`, { signal: abortSignal });
    return response.json();
  },
});
```

### When to Use What

| Scenario | Use |
|----------|-----|
| Simple HTTP GET that reacts to signals | `httpResource()` |
| HTTP with Observable needs (debounce, retry) | `rxResource()` from `@angular/core/rxjs-interop` |
| Non-HTTP async (WebSocket, IndexedDB, etc.) | `resource()` |
| Writing data (POST/PUT mutations) | `HttpClient` directly |

---

## 8. Forms — Reactive & Signal Forms

### Reactive Forms (Stable)

Prefer Reactive Forms over Template-driven forms.

```typescript
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="searchForm" (ngSubmit)="onSubmit()">
      <input formControlName="query" placeholder="Search...">
      <input formControlName="topK" type="number">
      <button type="submit" [disabled]="searchForm.invalid">Search</button>
    </form>
  `,
})
export class SearchPage {
  protected readonly searchForm = new FormGroup({
    query: new FormControl('', [Validators.required, Validators.minLength(3)]),
    topK: new FormControl(10, [Validators.min(1), Validators.max(100)]),
  });

  protected onSubmit(): void {
    const { query, topK } = this.searchForm.value;
    // ...
  }
}
```

### Signal Forms (Experimental — Angular 21+)

Signal Forms use a **model-first approach**: define your data as a signal, then derive the form from it.

```typescript
import { form, required, minLength, maxLength } from '@angular/forms/signals';

@Component({
  template: `
    <div>
      <label>
        Name:
        <input [field]="personForm.name" type="text" />
      </label>
      @for (err of personForm.name().errors(); track $index) {
        @if (err.kind === 'required') { <p>Name is required</p> }
        @if (err.kind === 'minLength') { <p>Name too short</p> }
      }
    </div>
  `,
})
export class PersonEditor {
  // 1. Define the model as a signal
  protected readonly person = signal({
    name: '',
    surname: '',
    phone: null as string | null,
  });

  // 2. Create the form with validation schema
  protected readonly personForm = form(this.person, (path) => {
    required(path.name);
    minLength(path.name, 3);
    required(path.surname);
    maxLength(path.surname, 40);
  });
}
```

**Note:** Signal Forms are experimental. The API may change before stable release. For production code in existing projects, Reactive Forms remain the recommended choice. Use Signal Forms for new projects and experimentation.

**Backward compatibility:** The `@angular/forms/signals/compat` package offers `compatForm()` for progressive migration from Reactive Forms to Signal Forms.

---

## 9. Routing

### Lazy Loading with Standalone Components

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search-page').then(m => m.SearchPage),
  },
  {
    path: 'candidate/:id',
    loadComponent: () => import('./features/candidate/candidate-detail').then(m => m.CandidateDetail),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [authGuard],
  },
];
```

### Functional Guards and Resolvers

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, ResolveFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);
};

export const candidateResolver: ResolveFn<Candidate> = (route) => {
  const service = inject(CandidateService);
  return service.getById(route.paramMap.get('id')!);
};
```

### Signal-Based Route Parameters

Use `input()` with router bindings (enable `withComponentInputBinding()`) for reactive route params.

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
  ],
};

// candidate-detail.ts — route param as signal input
@Component({ /* ... */ })
export class CandidateDetail {
  // Automatically bound from route param `:id`
  readonly id = input.required<string>();

  // Reactive data fetching based on route param
  protected readonly candidate = httpResource<Candidate>(
    () => `/api/candidates/${this.id()}`
  );
}
```

---

## 10. Change Detection & Zoneless

### Angular 21+ Default: Zoneless

Starting with Angular 21, new applications are **zoneless by default** — Zone.js is no longer included. Change detection fires only when explicitly triggered by:

- Signal value changes (`.set()`, `.update()`)
- Component input changes
- Event listeners bound in templates
- Async pipe emissions
- `markForCheck()` or `ChangeDetectorRef.detectChanges()` (escape hatch)

### Rules for Zoneless Applications

1. **Always use `OnPush`** change detection strategy.
2. **Use signals** for all reactive state.
3. **Use `async` pipe** or `toSignal()` for observables.
4. Understand that `setTimeout`, `setInterval`, `fetch`, and other async APIs **do NOT** automatically trigger change detection without Zone.js.
5. In tests, use `await fixture.whenStable()` instead of `fixture.detectChanges()` alone.

### Migrating to Zoneless

If your existing app relies on Zone.js, Angular 21 provides migration tools:

```bash
# The CLI migration automatically adds provideZoneChangeDetection() if needed
ng update @angular/core@21

# Use the MCP tool for analysis
ng mcp  # then use onpush_zoneless_migration tool
```

For legacy apps that still need Zone.js, explicitly add:

```typescript
// app.config.ts
import { provideZoneChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
  ],
};
```

---

## 11. Accessibility

### Requirements

- **MUST** pass all [AXE](https://www.deque.com/axe/) checks.
- **MUST** follow all [WCAG AA](https://www.w3.org/WAI/WCAG2AA-Conformance) minimums:
  - Focus management
  - Color contrast (4.5:1 minimum for normal text)
  - Proper ARIA attributes
  - Keyboard navigation support

### Practical Rules

- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<article>`, etc.).
- Always provide `alt` text for images.
- Use `aria-label` or `aria-labelledby` for interactive elements without visible text.
- Ensure all interactive elements are keyboard-accessible.
- Manage focus properly during navigation and modal dialogs.
- Test with screen readers and keyboard-only navigation.

### Angular Aria (Developer Preview — Angular 21+)

Angular Aria provides **headless, unstyled, accessible components** that you can style yourself:

```bash
npm install @angular/aria
```

It includes accessible patterns for menus, dialogs, tabs, combobox, and more — all signal-based and fully keyboard-navigable.

---

## 12. Performance

### Optimization Strategies

- Use `@defer` for below-the-fold content and optional features.
- Use `OnPush` change detection on **every** component.
- Use `track` in `@for` loops (always — it's required).
- Use `NgOptimizedImage` with `priority` for LCP images.
- Lazy-load routes with `loadComponent` / `loadChildren`.
- Import Angular Material components **directly** (not via modules).
- Keep initial bundle under **200KB**.
- Target **Lighthouse 90+**.

```typescript
// ✅ Direct component import — better tree-shaking
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

// ❌ Module import — includes unused components
import { MatButtonModule } from '@angular/material/button';
```

### Bundle Analysis

```bash
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/your-app/stats.json
```

---

## 13. Project Structure & Naming

### Recommended Structure

```
src/
├── app/
│   ├── core/                   # Singleton services, guards, interceptors
│   │   ├── services/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── shared/                 # Reusable components, directives, pipes
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   ├── features/               # Feature areas (organized by domain)
│   │   ├── search/
│   │   │   ├── search-page.ts
│   │   │   ├── search-page.html
│   │   │   ├── search-page.scss
│   │   │   ├── search-page.spec.ts
│   │   │   ├── components/     # Feature-specific components
│   │   │   └── models/         # Feature-specific interfaces
│   │   └── candidate/
│   │       ├── candidate-detail.ts
│   │       └── candidate-detail.html
│   ├── app.ts                  # Root component
│   ├── app.config.ts           # Application configuration
│   └── app.routes.ts           # Route definitions
├── styles/                     # Global styles, themes
└── main.ts                     # Bootstrap entry point
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `search-bar.ts`, `search-bar.html` |
| Components | PascalCase class | `SearchBar` |
| Services | PascalCase + `Service` suffix | `SearchService` |
| Test files | `.spec.ts` suffix | `search-bar.spec.ts` |
| Interfaces/Types | PascalCase | `Candidate`, `SearchResult` |
| Selectors | `app-` prefix + kebab-case | `app-search-bar` |
| Directive selectors | camelCase attribute | `[appHighlight]` |

### Rules

- **One concept per file** — one component, directive, or service per file.
- **Organize by feature**, not by type (avoid `components/`, `services/` at the top level).
- Group related files together (component + template + styles + test in same directory).
- Avoid generic file names like `helpers.ts` or `utils.ts` — use descriptive names.
- Name event handlers for **what they do**, not the triggering event (`saveUser()` not `handleClick()`).

---

## 14. Testing

### Angular 21+ Default: Vitest

New Angular 21 projects use **Vitest** as the default test runner (replacing Jasmine/Karma).

```typescript
import { TestBed } from '@angular/core/testing';
import { SearchBar } from './search-bar';

describe('SearchBar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBar],
    }).compileComponents();
  });

  it('should emit search event on valid input', async () => {
    const fixture = TestBed.createComponent(SearchBar);
    const component = fixture.componentInstance;
    
    // Use whenStable() for zoneless apps
    await fixture.whenStable();

    // Test signal reactivity
    component.query.set('Angular');
    expect(component.isValid()).toBe(true);
  });
});
```

### Testing httpResource

```typescript
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
});

it('should fetch user data', async () => {
  const mockBackend = TestBed.inject(HttpTestingController);
  // ... setup httpResource, flush mock requests, assert
});
```

### What to Test

- Signal reactivity chains
- Computed signal derivations
- Component inputs/outputs
- Service logic and data transformations
- Accessibility (keyboard navigation, ARIA attributes)
- Route guards and resolvers

---

## 15. Migration Checklist — Angular 17/18/19 → 20+

Use this checklist when upgrading older Angular projects or when AI agents encounter legacy code.

### Components

- [ ] Remove `standalone: true` from all decorators (it's the default in v20+)
- [ ] Replace `@Input()` → `input()` / `input.required()`
- [ ] Replace `@Output()` → `output()`
- [ ] Replace `@ViewChild` / `@ContentChild` → `viewChild()` / `contentChild()`
- [ ] Replace `@ViewChildren` / `@ContentChildren` → `viewChildren()` / `contentChildren()`
- [ ] Replace `@HostBinding` / `@HostListener` → `host: {}` in decorator
- [ ] Add `changeDetection: ChangeDetectionStrategy.OnPush` to all components
- [ ] Replace `@Input() + @Output()` two-way combos → `model()`

### Templates

- [ ] Replace `*ngIf` → `@if`
- [ ] Replace `*ngFor` → `@for` (with `track`)
- [ ] Replace `*ngSwitch` → `@switch`
- [ ] Replace `[ngClass]` → `[class.xxx]` or `[class]`
- [ ] Replace `[ngStyle]` → `[style.xxx]` or `[style]`
- [ ] Add `@defer` for heavy/below-the-fold content
- [ ] Replace `<img src="...">` → `<img ngSrc="...">`

### State Management

- [ ] Replace `BehaviorSubject` for simple state → `signal()`
- [ ] Replace manual derived state → `computed()`
- [ ] Replace complex RxJS `combineLatest` chains → `computed()` with signals
- [ ] Replace imperative state resets → `linkedSignal()`
- [ ] Replace `subscribe()` in components → `toSignal()` or async pipe
- [ ] Move writable signals behind services with `asReadonly()` public API

### Dependency Injection

- [ ] Replace constructor injection → `inject()` function
- [ ] Replace class-based guards/resolvers → functional guards/resolvers

### Data Fetching

- [ ] For simple reactive HTTP GETs → consider `httpResource()`
- [ ] Replace manual loading/error state tracking → use resource signals (`.isLoading()`, `.error()`, `.hasValue()`)

### Change Detection (Angular 21+)

- [ ] Evaluate readiness for zoneless (all OnPush + signals)
- [ ] Run `onpush_zoneless_migration` MCP tool for analysis
- [ ] Remove `provideZonelessChangeDetection()` call (it's the default in v21)
- [ ] Ensure async operations that need to trigger UI updates use signals

### Testing (Angular 21+)

- [ ] Consider migrating from Jasmine/Karma → Vitest
- [ ] Replace `fixture.detectChanges()` → `await fixture.whenStable()`
- [ ] Remove `HttpClientTestingModule` → use `provideHttpClientTesting()`

### Forms (Angular 21+)

- [ ] For new forms, consider experimental Signal Forms (`@angular/forms/signals`)
- [ ] Use `compatForm()` for incremental migration from Reactive Forms
- [ ] Replace `FormBuilder` boilerplate → Signal Forms `form()` function

### Angular Material 20+

- [ ] Replace module imports (`MatButtonModule`) → direct component imports (`MatButton`)
- [ ] Replace element selectors (`mat-button`) → attribute selectors (`matButton`)
- [ ] Update theming to use `mat.theme()` and system tokens (CSS variables)
- [ ] Replace style overrides via internal class names → `mat.theme-overrides()` / `mat.<component>-overrides()`

---

## 16. Quick Reference — DO vs DON'T

### ✅ DO

| Practice | Example |
|----------|---------|
| Signals for state | `signal()`, `computed()`, `linkedSignal()` |
| Signal inputs/outputs | `input()`, `input.required()`, `output()`, `model()` |
| Signal queries | `viewChild()`, `viewChildren()`, `contentChild()` |
| `inject()` function | `private readonly http = inject(HttpClient)` |
| Native control flow | `@if`, `@for`, `@switch` |
| Deferred loading | `@defer (on viewport)` |
| `OnPush` always | `changeDetection: ChangeDetectionStrategy.OnPush` |
| `host` object | `host: { '(click)': 'onClick()' }` |
| Class/style bindings | `[class.active]="isActive()"` |
| `NgOptimizedImage` | `<img ngSrc="..." width="..." height="..." alt="...">` |
| Reactive Forms (stable) | `FormGroup`, `FormControl`, `Validators` |
| Signal Forms (experimental) | `form()`, `required()`, `minLength()` |
| `httpResource` for fetching | `httpResource(() => url)` |
| `readonly` on Angular props | `readonly name = input()` |
| `protected` for template | `protected readonly x = computed(...)` |
| Feature-based folders | `features/search/`, `features/admin/` |
| Functional guards | `export const authGuard: CanActivateFn = ...` |

### ❌ DON'T

| Anti-Pattern | Replacement |
|--------------|-------------|
| `standalone: true` in v20+ | Remove it (it's the default) |
| `@Input()` / `@Output()` decorators | `input()` / `output()` functions |
| `@HostBinding` / `@HostListener` | `host: {}` in decorator |
| `@ViewChild` / `@ContentChild` | `viewChild()` / `contentChild()` |
| `*ngIf` / `*ngFor` / `*ngSwitch` | `@if` / `@for` / `@switch` |
| `[ngClass]` / `[ngStyle]` | `[class.x]` / `[style.x]` |
| `constructor(private http: HttpClient)` | `inject(HttpClient)` |
| `BehaviorSubject` for simple state | `signal()` |
| `any` type | `unknown` |
| `mutate()` on signals | `update()` or `set()` |
| Arrow functions in templates | Move to `computed()` or methods |
| Globals in templates (`new Date()`) | Use signals |
| `MatButtonModule` | Import `MatButton` directly |
| Generic names (`utils.ts`) | Descriptive names |
| `handleClick()` event name | `saveUser()` (describes the action) |

---

## Angular CLI MCP Server

The Angular CLI includes an MCP (Model Context Protocol) server for AI-assisted development:

```bash
# Start MCP server
ng mcp

# With experimental tools
ng mcp --experimental-tool
```

**Available tools:**

| Tool | Purpose |
|------|---------|
| `get_best_practices` | Returns Angular best practices guide |
| `list_projects` | Finds Angular projects in workspace |
| `search_documentation` | Searches official Angular docs |
| `find_examples` | Provides modern Angular code examples |
| `onpush_zoneless_migration` | Analyzes code and produces migration plan |
| `ai_tutor` (experimental) | Interactive Angular learning assistant |
| `modernize` (experimental) | Runs code migrations via schematics |

---

## References

- [Angular Official Docs](https://angular.dev)
- [Angular AI Development Guide](https://angular.dev/ai/develop-with-ai)
- [Angular Style Guide](https://angular.dev/style-guide)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Angular httpResource Guide](https://angular.dev/guide/http/http-resource)
- [Angular v21 Release Blog](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Angular AI Design Patterns](https://angular.dev/ai/design-patterns)
- [Angular MCP Server Setup](https://angular.dev/ai/mcp)
- [Angular llms.txt](https://angular.dev/llms.txt)
- [Angular llms-full.txt](https://angular.dev/assets/context/llms-full.txt)
