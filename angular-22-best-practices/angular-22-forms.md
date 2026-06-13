# Angular 22 — Forms (Signal Forms First)

> Part of the Angular 22 Best Practices set. **Signal Forms (`@angular/forms/signals`) are the standard approach for new forms in v22.** Reactive Forms remain fully supported for existing code; template-driven forms are legacy. Load this document for any form work.

---

## 1. The Model-First Mental Model

Signal Forms invert the classic approach: you define the **data as a signal**, then derive the form from it. The form is a reactive view over your model — there is no separate "form value" to sync.

```typescript
import { ChangeDetectionStrategy, Component, linkedSignal, inject } from '@angular/core';
import { form, required, minLength, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-flight-edit',
  imports: [FormField],                       // the binding directive
  templateUrl: './flight-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightEdit {
  private readonly store = inject(FlightDetailStore);

  // local working copy of store data — resets when the store emits a new flight
  protected readonly flight = linkedSignal(() => normalizeFlight(this.store.flight()));

  // form = model + validation schema
  protected readonly flightForm = form(this.flight, (path) => {
    required(path.from);
    minLength(path.from, 3);
    required(path.to);
  });
}
```

```html
<label for="from">From</label>
<input id="from" [formField]="flightForm.from" />

@for (err of flightForm.from().errors(); track $index) {
  @if (err.kind === 'required')  { <p class="error">From is required</p> }
  @if (err.kind === 'minLength') { <p class="error">At least 3 characters</p> }
}

<button type="submit" [disabled]="flightForm().invalid()" (click)="save()">Save</button>
```

Key facts:
- `form(modelSignal, schemaFn)` returns a **FieldTree** mirroring the model's shape: `flightForm.from`, `flightForm.aircraft.type`, `flightForm.prices[0].amount`.
- Each field node is callable — `flightForm.from()` — yielding field state: `value()`, `errors()`, `valid()`/`invalid()`, `touched()`, `dirty()`, `disabled()` (+ `disabledReasons()`), `readonly()`, `hidden()`, `pending()`.
- Bind with the `[formField]` directive (import `FormField`). Two-way: typing updates the model signal immediately; setting the model updates the UI.
- Pair with a store via `linkedSignal` (working copy) or a delegated signal (write-through) — see di-services-state doc.

## 2. Schemas & Validation

```typescript
import { schema, required, minLength, maxLength, min, max, pattern, email,
         validate, disabled, readonly, hidden, debounce } from '@angular/forms/signals';

// reusable, separately-defined schema
export const flightSchema = schema<Flight>((path) => {
  required(path.from);
  minLength(path.from, 3);
  max(path.delay, 600);

  // [v22] when-property form (≤v21 used a positional second argument)
  disabled(path.delay, {
    when: (ctx) => !ctx.valueOf(path.delayed),
    reason: 'Only delayed flights have a delay',
  });
  readonly(path.id, { when: () => true });
  hidden(path.delay, { when: (ctx) => !ctx.valueOf(path.delayed) });

  debounce(path.from, 300);   // per-field validation debounce
});

protected readonly flightForm = form(this.flight, flightSchema);
```

- `disabled` supports `reason` strings surfaced via `disabledReasons()`. `readonly` blocks writes automatically; `hidden` is **only a hint** — your template must actually hide the field (and its label): `@if (!flightForm.delay().hidden()) { … }`.
- Conditional/cross-field logic reads sibling values through `ctx.valueOf(path.other)`.

### Custom validators

```typescript
validate(path.from, ({ value }) =>
  CITIES.includes(value()) ? undefined : { kind: 'unknownCity' });

// multi-field / tree validators: attach validate() to a parent path and
// read children via ctx — errors can target specific child fields.
```

- Return `undefined` (valid) or an error object with a `kind` discriminator; templates switch on `err.kind`.
- Refactor recurring validators into named functions.
- **Async/HTTP validators** return resources/promises; field exposes `pending()` while in flight.

### Zod / Standard Schema
`validateStandardSchema(path, ZodSchema)` plugs any Standard-Schema-compliant library (Zod, Valibot…) into a field or the whole tree. Use the same Zod schema for `httpResource({ parse })` and form validation to keep one source of truth for the model's shape.

## 3. Submission

```typescript
import { submit } from '@angular/forms/signals';

protected async save(): Promise<void> {
  await submit(this.flightForm, async (f) => {
    const saved = await this.client.save(f().value());
    this.store.setFlight(saved);
    return undefined;                  // or return server-side field errors
  });
}
```

- `submit()` marks all fields touched, runs validation, only invokes the callback when valid, and tracks `submitting()` state — bind it to disable the button.
- Map server-side validation failures by returning error objects targeting fields.

## 4. Visualizing Validation State

Signal Forms set CSS classes on bound controls (`ng-valid`, `ng-invalid`, `ng-touched`, `ng-dirty`, …). Style globally:

```css
input.ng-invalid.ng-touched { border-color: var(--error); }
```

Show messages only when `touched()` (or after submit) to avoid yelling at users on pristine fields.

## 5. Large Forms: Groups, Arrays, Subforms

- **Nested objects** are just nested paths — `path.aircraft.type` — no `FormGroup` ceremony.
- **Arrays**: model as arrays in the signal; iterate the field tree:

```html
@for (price of flightForm.prices; track $index) {
  <input [formField]="price.flightClass" />
  <input [formField]="price.amount" type="number" />
}
```

Add/remove rows by updating the **model signal** immutably (`update(f => ({ ...f, prices: [...f.prices, newPrice] }))`); validate arrays with tree validators (e.g., min one price, unique classes).
- **Subforms**: extract a child component taking `readonly field = input.required<FieldTree<Price>>()` and binding internally — schemas compose via `apply`/sub-schemas.
- **Custom fields**: any component implementing the form-control contract can be bound with `[formField]` (e.g., a stepper) — prefer this over wiring manual events.
- **Metadata**: schemas can attach metadata (labels, hints, custom keys) readable from field state — use for generic field wrappers instead of prop-drilling.

## 6. Null/Undefined Discipline

Prefer fully-initialized models (`initialFlight` constants) over `null`-riddled ones; normalize incoming data (`normalizeFlight`) before handing it to `form()`. This keeps the FieldTree's types clean and avoids optional-chaining noise in templates.

## 7. Legacy: Reactive Forms

For existing Reactive-Forms code: keep `FormGroup`/`FormControl`/`Validators`, typed forms, `ReactiveFormsModule`. Migrate incrementally (the compat layer `@angular/forms/signals/compat` exists for bridging). Do **not** start new features with Reactive Forms in a v22 codebase without a stated reason. Template-driven forms (`ngModel`) are not used in new code.
