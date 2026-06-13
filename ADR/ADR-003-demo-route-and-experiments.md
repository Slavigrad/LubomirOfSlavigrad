# ADR-003: Fate of the `/demo` Route and Experimental Components

- **Status:** Accepted (2026-06-13) — DECIDE items resolved (recorded below); `performance-monitor` remains deferred to ADR-004
- **Date:** 2026-06-12 (proposed), 2026-06-13 (accepted)
- **Deciders:** Lubomir (owner), Claude (analysis)
- **Depends on:** ADR-001 (target structure and module rules). Related: ADR-004 (performance services — one item here is coupled to it).
- **Scope:** the `/demo` route, `shared/components/ui/collapse-demo.component.ts`, and the experimental components `modern-card`, `modern-lifecycle`, `signal-form`, `performance-monitor` (+ the `shared/components/modern/index.ts` barrel).

---

## Context

The codebase contains a second category of code the restructure must place: not speculative *infrastructure* (ADR-002) but **learning artifacts and showcases** — code written to practice modern Angular signal APIs or to demonstrate the UI kit. `src-project-structure.md` itself labels them: *"`shared/components/modern`, `signal-form`, `modern-card`, `modern-lifecycle` … indicate experimentation with modern Angular signal APIs."*

### Evidence (verified)

- **`/demo` is a live public route.** `app.routes.ts` lazy-loads `CollapseDemoComponent` directly from `./shared/components/ui/collapse-demo.component`. The component is a genuine showcase page exercising `Collapse`, `Accordion`, `CollapsibleCard`, `CollapseGroup`, and `Button` with variant/animation/state switching.
- **Layering violation:** a routed smart page lives *inside* the dumb-component UI kit folder. Under ADR-001 rule 3 (`feature → ui → data → util`, never the reverse), a `ui` module must not contain a routed feature. Wherever the page ends up, it cannot stay where it is.
- **No mount point found** for `modern-card`, `modern-lifecycle`, `signal-form`, or `performance-monitor` in `home`, `egypt-story`, `app.html`, or any section component. `modern-card` has a spec file and is a well-built demonstration of signal `input()`/`output()`/`model()`/`viewChild()`; `modern-lifecycle` and `signal-form` are similar API exercises.
- **`performance-monitor` contains a defect:** `setInterval` started in the constructor with no teardown (no `DestroyRef`/`takeUntilDestroyed`), i.e. a timer leak if the component is ever mounted and destroyed. The codebase even contains an unused `shared/utils/interval-manager.ts` that exists to solve exactly this. It also depends entirely on the ADR-004 service suite.

### The real question

These artifacts have a property the ADR-002 code did not: **for a portfolio site, demonstration code can be product.** A public UI-kit showcase and clean signal-API exercises are evidence of skill — arguably more persuasive to a technical reviewer than the CV text itself. So "delete all dead code" is too blunt here; the decision is *where demonstration code may live so it cannot rot the architecture*.

---

## Decision

### 1. Introduce a quarantined `lab` area for experiments

Create `domains/lab/` as the designated home for learning artifacts and showcases, with one hard Sheriff rule added to ADR-001's set:

> **Rule 8: Nothing outside `domains/lab` may import from `domains/lab`.** Lab may import from `domains/shared/*` (it showcases the design system), but it is a dependency *sink* — experiments can never leak into production domains.

This is the same idea as a Spring `@Profile("dev")` sandbox module or a separate `playground` Gradle module: a fenced area where the cost of experimentation is zero because the compiler guarantees it cannot couple to anything. It also gives every future "I want to try the new Angular X API" a home, ending the pattern that created this mess — experiments landing in `shared/` because nowhere else made sense.

```text
domains/
  lab/
    lab.routes.ts                  # /lab/** — all experiment routes in one place
    feature-ui-showcase/           # collapse-demo, relocated and renamed
    feature-signal-playground/     # modern-card, modern-lifecycle, signal-form
                                   # (those that survive the inventory below)
```

### 2. Inventory

| Item | Verdict | Rationale |
|---|---|---|
| `collapse-demo.component.ts` + `/demo` route | **KEEP, relocate** to `domains/lab/feature-ui-showcase/`, route becomes `/lab/ui-showcase` (optionally keep a `/demo` → redirect for old links) | Genuine portfolio asset: a working design-system showcase. Relocation also fixes the layering violation (routed page out of the `ui` folder). Add `<meta name="robots" content="noindex">` via route data or title strategy if it should stay out of search results — owner's call. |
| `modern-card.component.ts` (+ spec) | **RESOLVED → KEEP, lab** (`feature-signal-playground`) | Owner decision 2026-06-13. The most polished signal-API demo (input/output/model/viewChild, has a spec) and currently renders nowhere; mounting it on a lab route makes it a portfolio asset. |
| `modern-lifecycle.component.ts` | **RESOLVED → DELETE** | Owner decision 2026-06-13. More tutorial than showpiece; the signal APIs it demonstrates are already used in production components, so the lesson is captured. |
| `signal-form.component.ts` | **RESOLVED → KEEP, lab** (`feature-signal-playground`) | Owner decision 2026-06-13. Retained explicitly as the prototype for a future signal-based rebuild of the contact form. |
| `performance-monitor.component.ts` | **DEFER to ADR-004** | It is a dashboard over the performance service suite whose own fate is undecided. If ADR-004 keeps the services, this component moves to lab *after* fixing the interval leak (`DestroyRef` + `takeUntilDestroyed`, or delete the timer). If ADR-004 deletes the services, this component goes with them. Do not relocate it before ADR-004 is resolved. (Phase 0 note: the missing-teardown `setInterval` is confirmed present.) |
| `shared/components/modern/index.ts` barrel | **DELETE** | Barrel for the relocated/deleted experiments; nothing outside lab may import them anyway (Rule 8), and lab features import their own files directly. |

### 3. Sequencing

Execute together with the ADR-001 restructure move (Phase 4), not before: these are pure relocations plus one route change, and creating `domains/lab` only makes sense once `domains/` exists. The `performance-monitor` row waits for ADR-004 regardless.

---

## Considered alternatives

**A. Delete all experiments outright (strict YAGNI).**
Rejected as the default, accepted as Option B per item. YAGNI targets speculative *production* machinery (ADR-002); these are demonstrations on a site whose purpose is demonstration. Deleting the UI showcase would remove the strongest live evidence of the design system's quality.

**B. Keep the showcase inside `domains/shared/ui-glass/` as a "demo" subfolder.**
Rejected. It re-creates the current layering violation in the new structure: a routed smart page inside a ui module, and `shared` acquiring a route. `shared` must stay a leaf that domains depend on, never a thing the router mounts.

**C. A dev-only build flag instead of a lab domain (strip `/lab` from production builds).**
Rejected for now, viable later. It adds build complexity (environment-conditional routes) to hide pages that are arguably *meant* to be seen on a portfolio. If a future experiment is genuinely not for public eyes, gate that one route then — `lab.routes.ts` is the single place to do it.

---

## Consequences

**Positive:** experiments get a permanent, compiler-fenced home, so future learning never pollutes `shared/` again; the layering violation around `/demo` is fixed; the UI showcase is preserved and properly framed as a portfolio feature; one latent timer leak is either fixed or deleted; the `shared` area shrinks toward its ADR-001 ideal (only code with demonstrated cross-domain consumers).

**Negative / costs:** a third top-level domain for a small site (mitigated: it is explicitly non-production by rule, and the alternative — experiments scattered through `shared/` — is what this ADR exists to end); old `/demo` bookmarks break unless the redirect is kept; Rule 8 is one more Sheriff rule to maintain.

## Compliance check

Done when: `domains/lab` exists with Rule 8 active and the build green; `/lab/ui-showcase` renders the collapse showcase; no file under `shared/` contains a routed component; the `modern/` barrel is gone; every DECIDE row is resolved and recorded in this ADR; the `performance-monitor` row carries a pointer to the ADR-004 resolution; visual smoke passes on `/`, `/egypt-story`, and the new lab route.
