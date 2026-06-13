# Angular 22 — Components & Templates

> Part of the Angular 22 Best Practices set. Load when creating or editing components, directives, templates, or bindings. Core rules in `angular-22-best-practices.md` always apply.

---

## 1. Component Anatomy (Canonical Form)

```typescript
// src/app/domains/ticketing/ui/flight-card/flight-card.ts
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Flight } from '../../data/flight';

@Component({
  selector: 'app-flight-card',
  imports: [DatePipe],
  templateUrl: './flight-card.html',
  styleUrl: './flight-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightCard {
  // 1. Angular-specific properties first: injections, inputs, outputs, models, queries
  readonly flight = input.required<Flight>();
  readonly compact = input(false);                 // optional, with default
  readonly selected = output<number>();

  // 2. Derived state
  protected readonly route = computed(() => `${this.flight().from} → ${this.flight().to}`);

  // 3. Methods last
  protected select(): void {
    this.selected.emit(this.flight().id);
  }
}
```

Rules encoded above:
- Class name **without** `Component` suffix; file `flight-card.ts` (kebab-case, no `.component` infix). Template/styles share the base name.
- No `standalone: true` (implicit).
- `OnPush` written explicitly even though it's the v22 default (self-documenting, backward compatible).
- Angular-managed properties are `readonly`; template-only members are `protected`; internals are `private`.
- Group Angular-specific properties (inject/inputs/outputs/queries) at the top, before methods.
- External template/style paths are relative to the TS file. Prefer inline templates for very small components (≲15 lines).
- Selectors: `app-` (or project prefix from `angular.json`) + kebab-case for components; camelCase attribute selectors with the same prefix for directives (`[appTooltip]`).
- Keep components focused on presentation; factor UI-independent logic (validation rules, data transforms) into separate functions/services.
- Keep lifecycle hooks trivial: call well-named methods from `ngOnInit`, don't inline logic. Implement the lifecycle interface (`implements OnInit`) when using a hook. Prefer signals/effects over lifecycle hooks where possible.

## 2. Inputs, Outputs, Two-Way Binding

```typescript
readonly candidate = input.required<Candidate>();   // required input → InputSignal
readonly showDetails = input(false);                // optional with default
readonly selected = output<string>();               // OutputEmitterRef
readonly checked = model(false);                    // ModelSignal — two-way bindable
```

- `model()` replaces the `@Input() x` + `@Output() xChange` pair. Parent: `<app-toggle [(checked)]="enabled" />`.
- Read inputs as signals: `this.candidate()`. Derive with `computed()` — never copy an input into another signal via `effect()`.
- Transform on the way in when needed: `input(false, { transform: booleanAttribute })`.
- Choose input/output names by meaning, not mechanics; never prefix outputs with `on` (`selected`, not `onSelected`).

## 3. Host Element

Use the `host` object. `@HostBinding` / `@HostListener` are forbidden in new code.

```typescript
@Component({
  selector: 'app-toggle-button',
  host: {
    role: 'switch',
    '[class.active]': 'isActive()',
    '[attr.aria-checked]': 'isActive()',
    '(click)': 'toggle()',
    '(keydown.enter)': 'toggle()',
  },
  /* ... */
})
```

## 4. Queries (View & Content)

```typescript
private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
private readonly sort = viewChild.required(MatSort);   // throws if missing
private readonly cards = viewChildren(FlightCard);
private readonly header = contentChild(PaneHeader);
private readonly items = contentChildren(MenuItem);
```

- All return signals; access with `()`. Available reactively — no `AfterViewInit` gymnastics needed for most cases.
- **Question every `viewChild`.** If the child is statically known, prefer communicating via inputs/outputs or template variables. Queries are for genuinely dynamic/projected structure. Parent→child method calls via queries create tight coupling; a shared (component-provided) service or signal input is usually better.

## 5. Content Projection

```html
<!-- tab.html -->
<div class="tab" [hidden]="!visible()">
  <ng-content select="[header]" />   <!-- targeted slot -->
  <ng-content />                      <!-- default slot -->
</div>
```

- Multi-slot via `select`. For code-driven projection (tables, repeaters), use `ng-template` + `NgTemplateOutlet` with context objects, or `ViewContainerRef` accessed through a signal query.
- Modal dialogs / dynamic components: `createComponent` API or CDK overlay; prefer Angular Aria / CDK Dialog over hand-rolled DOM.

## 6. Built-in Control Flow

```html
@if (vm.isLoading()) {
  <app-spinner />
} @else if (vm.error()) {
  <app-error [error]="vm.error()" />
} @else {
  @for (flight of vm.flights(); track flight.id) {
    <app-flight-card [flight]="flight" (selected)="select($event)" />
  } @empty {
    <p>No flights found.</p>
  }
}
```

- `track` is mandatory in `@for`. Track a stable unique id; `track $index` only for primitive/static lists.
- `@switch` for closed unions — and make it exhaustive with `never()` `[v22]`:

```html
@switch (loyalty()) {
  @case ('bronze') { … }
  @case ('silver') { … }
  @case ('gold')   { … }
  @default never(loyalty())   <!-- compile error if a union member is uncovered [v22] -->
}
```

`never(expr)` tells the compiler which expression must be exhausted; adding `'platinum'` to the union becomes a compile-time error instead of a silent fall-through.

## 7. Template Expression Rules

- Templates accommodate simple JavaScript-like expressions; refactor anything complex into a `computed()`.
- No arrow functions, no regex literals, no `new Date()` / globals in templates.
- Pipes for formatting (`date`, `currency`, `async`); write custom pure pipes for repeated transforms instead of method calls in templates.
- Bind classes/styles natively:

```html
<div [class.admin]="isAdmin()" [class.dense]="density() === 'high'">
<div [style.color]="textColor()" [style.font-size.px]="fontSize()">
<div [class]="{ admin: isAdmin(), dense: density() === 'high' }">
```

## 8. Deferred Loading in Templates

```html
@defer (on viewport; prefetch on idle) {
  <app-heavy-chart [data]="chartData()" />
} @placeholder { <div class="chart-skeleton"></div> }
@loading (minimum 100ms) { <app-spinner /> }
@error { <p>Failed to load chart.</p> }
```

Triggers: `on idle | viewport | interaction | hover | immediate | timer(3s)`, `when (condition)`, plus `prefetch on …`. Use for below-the-fold and optional UI. SSR hydration triggers (`hydrate on …`) → performance-ssr doc.

## 9. Images

Use `NgOptimizedImage` for every static image (not for inline base64):

```html
<img ngSrc="/assets/hero.webp" width="1200" height="600" alt="Hero" priority>  <!-- LCP image -->
<img ngSrc="/assets/avatar.png" width="48" height="48" alt="">
```

- `width`/`height` (or `fill`) mandatory; `priority` on the LCP image; meaningful `alt` (empty `alt=""` for decorative).

## 10. File Set & Styling Strategy

**Do not unconditionally generate `.ts` + `.html` + `.scss`.** The rule:

| File | When |
|---|---|
| `name.ts` | Always |
| `name.html` | Template is non-trivial (≳15 lines). Below that, an inline `template:` is preferred. |
| `name.scss` / `.css` | **Only** when the component has component-specific styles. **Never create an empty or placeholder style file.** |

Styling is layered — most components should need **no** local stylesheet:

1. **Design system first.** Global theme, design tokens (CSS custom properties), and the design system's classes/directives (e.g., Angular Material theming, or an enterprise system like Oblique with `ob-grid`, `obButton="primary"`) live in global `styles/` and carry the bulk of all styling.
2. **Shared patterns second.** Reusable visual patterns belong in `shared/ui` components or global utility classes — not copy-pasted into per-component SCSS.
3. **Component styles last.** Scoped (emulated encapsulation) and therefore *not* inheritable — a component stylesheet may only contain layout/appearance unique to that component. If you are writing button colors, card shadows, or typography in a component `.scss`, stop: that belongs in the design system.

Agent checks: before adding a component stylesheet, look for an existing design-system class; before restyling a primitive (button, input, card), use the project's UI library component instead.

## 11. Internationalization of User-Facing Text

**User-facing strings never appear as literals in templates or TypeScript.** Centralizing copy into TS constants files is *not* i18n — it bakes untranslatable text into the bundle.

Detect and follow the project's mechanism:

- **Runtime translation** (dominant in enterprise apps; required by systems like Oblique): ngx-translate/Transloco — keys in templates (`{{ 'CANTONS.TITLE' | translate }}`), copy in `assets/i18n/en.json` (one file per locale, nested SCREAMING_CASE or dot-path keys). Adding UI = adding keys to **all** locale files.
- **Compile-time translation** (framework built-in): `@angular/localize` — `i18n` attributes in templates, `$localize` tagged strings in code, extraction via `ng extract-i18n`, one bundle per locale.

Rules for agents:
- New visible text → new translation key + entries in every locale file present. Never hardcode "just for now".
- Validation messages, `aria-label`s, button labels, placeholders, notification messages — all of it goes through i18n (note `message: 'CANTONS.MESSAGE.SUCCESS'` passed as a *key* to the notification service, translated downstream).
- Keys are stable identifiers named by feature + purpose (`CONTACT.FORM.SUBMIT`), not by the English text.
- If the project has no i18n mechanism and none is requested, still keep copy out of logic (template-level, grouped) and flag i18n as a decision to make — do not invent `TEXT_CONSTANTS` objects.

## 12. Directives

```typescript
@Directive({
  selector: '[appConfirm]',
  host: { '(click)': 'confirmThenRun($event)' },
})
export class Confirm {
  readonly appConfirm = input<string>('Are you sure?');
  readonly confirmed = output<void>();
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  /* ... */
}
```

- Same signal APIs as components. Use directives for cross-cutting element behavior; prefer them over inheritance.
- For controlled DOM manipulation inside a directive, use `Renderer2`/`ElementRef` carefully and never insert untrusted strings (→ security doc).
- Structural directives are legacy authoring style — built-in control flow and `ng-template` + context cover almost all needs.
