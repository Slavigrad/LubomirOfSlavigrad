# ADR-005: Tooling Baseline — Test Runner, Lint, and Boundary Enforcement

- **Status:** Proposed
- **Date:** 2026-06-13
- **Deciders:** Lubomir (owner), Claude (analysis)
- **Depends on:** ADR-001 (the boundaries Sheriff must enforce). Enables safe execution of ADR-002/003/004 (gives the executor a real test gate) and the restructure move.
- **Scope:** the project's quality gates — test runner, linting, formatting check, and architectural boundary enforcement. Not application code.

---

## Context

The verification work exposed three holes in the safety net, and a fourth that ADR-001 created on purpose:

1. **No working test gate.** The repo is mid-migration between test runners. One snapshot (`package.json`/`angular.json` as inspected) still carries the full Karma/Jasmine stack and the `@angular/build:karma` builder. A later snapshot (the 2026-06-13 baseline report) shows Karma *removed* and vitest (`^4.1.8`) + `@vitest/coverage-v8` + `jsdom` installed but **not configured** — no `vitest.config.*`, no test script. Net effect right now: `npm test` either runs the old Karma path or fails to resolve, and there is **no reliable automated test gate** either way. Three `.spec.ts` files exist and are written for Jasmine.

2. **No lint.** ESLint 9 and `@typescript-eslint/*` 8 are installed, but there is no `lint` script, no ESLint builder in `angular.json`, and no flat config (`eslint.config.js`). `ng lint` does not run. knip flags the eslint packages as "unused devDeps" precisely because nothing wires them.

3. **No formatting gate.** Prettier is configured (printWidth 100, single quotes) and runs on save, but nothing checks formatting in a repeatable command.

4. **No boundary enforcement.** ADR-001's module rules (cv ⊥ memoir, shared imports no domain, feature ⊥ feature, nothing imports `lab`, `internal/` is private) are currently held by convention only — the dead-code pass confirmed the boundaries are clean *today*, but nothing prevents the next import from violating them. This is the `ArchUnit`/`Spring Modulith` gap: rules that aren't compiled are rules that rot.

A deletion/restructure program (ADR-002/003/004 + the move) is about to run against a codebase whose **only** mechanical gate is `ng build`. With no tests, a refactor that compiles but breaks runtime behavior ships silently. The tooling baseline must be restored *before* the destructive executor does meaningful work — or at minimum, the test gate must be.

---

## Decision

Establish four gates, each a single repeatable command, wired so `slavigrad-validate` can run them and the ADR executor can depend on them.

### 1. Test runner: **vitest** (not Karma)

Adopt vitest as the test runner; finish removing Karma. Rationale: vitest is already the
chosen direction (installed in the later snapshot), is the modern default for Angular
via `@analogjs/vitest-angular` / the Angular vitest builder, runs far faster than
Karma+Chrome, and needs no browser launcher in CI. Deliverables:

- Add `@analogjs/platform` (or the `@angular/build:unit-test` vitest builder, whichever
  the installed Angular 21 minor supports — the setup command detects this) + a
  `vitest.config.ts` with the `jsdom` environment.
- Wire `"test": "vitest run"` and `"test:watch": "vitest"` in `package.json`.
- Migrate the 3 existing `.spec.ts` from Jasmine matchers to vitest `expect` (mostly
  `jasmine.createSpy` → `vi.fn`, `spyOn` semantics, and import of `describe/it/expect`
  from `vitest`). Angular `TestBed` usage is unchanged.
- Fully remove the Karma stack (`karma*`, `jasmine-core`, `@types/jasmine`, the
  `angular.json` `test` builder block) once vitest is green.

**Coverage expectation is deliberately modest:** the goal is a *working gate plus
characterization tests for the code that survives the deletions*, not a coverage target.
Priority specs: `CvDataService` (the experience-duration math, skill grouping — the
genuine domain logic ADR-002 keeps) and a render smoke test per route. These are the
tests that would catch a bad deletion.

### 2. Lint: **ESLint flat config + angular-eslint**

- Add `angular-eslint` and an `eslint.config.js` (flat config) extending the recommended
  TypeScript + Angular template rule sets.
- Wire `"lint": "ng lint"` (via the angular-eslint builder) or `"lint": "eslint ."` —
  the setup command picks whichever integrates cleanly with Angular 21.
- Start **lenient**: the first config should produce a green (or warnings-only) baseline
  on existing code, so lint can join the gate without a hundred-error wall. Tightening
  rules is incremental, not a blocker.

### 3. Format gate

- Wire `"format:check": "prettier --check ."` and `"format": "prettier --write ."`.
  `validate` runs `--check`; only humans run `--write`.

### 4. Boundary enforcement: **Sheriff**

- Add `@softarc/sheriff-core` + `@softarc/eslint-plugin-sheriff`, wired into the flat
  ESLint config so violations are lint errors (and thus build/CI failures).
- Author `sheriff.config.ts` encoding ADR-001's rules: tag modules by domain
  (`cv`, `memoir`, `lab`, `shared`) and layer (`feature`, `ui`, `data`, `util`); forbid
  cv↔memoir, shared→any-domain, feature→feature, *→lab, and cross-`internal/` imports.
- **Sequencing nuance:** Sheriff's value is realized only once the `domains/` structure
  exists (ADR-001 move). So Sheriff is *installed* in this ADR but its rules are
  authored/enabled as part of the move — installing earlier against the current
  type-first tree would encode rules for folders that don't exist yet. Until then,
  Sheriff config ships disabled/empty with a TODO tied to the move.

---

## Sequencing (how this slots into the program)

1. **This ADR's #1 (vitest) runs FIRST — before the ADR-002 executor does runtime
   refactors.** That is the whole point: give the destructive phase a test gate. The
   `slavigrad-setup-vitest` command implements it.
2. Lint (#2) + format (#3) can land in parallel; lenient config means low risk.
3. Sheriff (#4) installs now, rules enabled during the ADR-001 move.
4. Only then does `slavigrad-validate` reach its full form: build + vitest + lint +
   format, with Sheriff folded into lint.

Until #1 lands, the executor agent operates under its "no test gate — build only, smaller
units, owner smoke-test" rules (already encoded). This ADR is what lets those caveats be
removed.

---

## Considered alternatives

**A. Keep Karma.** Rejected — the project already started removing it; Karma+Chrome is
slow, CI-hostile, and the heavier setup. No reason to reverse a half-done, correct move.

**B. Skip tests, rely on build + manual smoke.** Rejected as the *permanent* answer
(it's the acceptable *temporary* one). A deletion program touching `CvDataService` with
no tests is how silent runtime regressions ship. Even a thin characterization suite over
the surviving domain logic changes the risk profile sharply.

**C. Defer Sheriff until "later".** Rejected — "later" is how the boundary rots. Install
now, enable at the move. The cost of installing early is near zero; the cost of an
unenforced boundary compounds.

**D. Tighten lint rules aggressively from day one.** Rejected — a hundred-error first run
gets the gate disabled out of frustration. Lenient-then-incremental is how lint actually
survives.

---

## Consequences

**Positive:** the destructive phases gain a real test gate; ADR-001's boundaries become
compiler-enforced (true ArchUnit parity); `validate` becomes a complete quality gate;
the eslint packages knip flagged as unused become used; formatting stops drifting.

**Negative / costs:** migrating 3 specs + writing characterization tests is real work
before the "fun" deletions; vitest+Angular wiring has known sharp edges on some Angular
minors (the setup command must detect the supported builder); a lenient lint baseline
means real issues hide until rules tighten (accepted — incremental).

**Open DECIDEs for the owner:**
- **D1:** vitest integration path — `@analogjs/vitest-angular` vs the native
  `@angular/build:unit-test` builder. Recommend the setup command detect and report
  which the installed Angular 21 minor supports, then you choose.
- **D2:** coverage threshold — none (gate only) to start, or a low floor (e.g. lines 30%)
  to ratchet up? Recommend none initially; add a floor once characterization tests exist.
- **D3:** lint strictness ceiling — how far to eventually tighten (e.g. enable
  `@typescript-eslint/no-explicit-any`, which the validators/SignalState code would
  currently fail). Recommend deferring until after ADR-002 deletes most `any` offenders.

## Compliance check

Done when: `npm test` runs vitest green; the 3 legacy specs pass under vitest; Karma fully
removed; `npm run lint` runs with a green/warnings-only baseline; `npm run format:check`
wired; Sheriff installed with `sheriff.config.ts` present (rules enabled at the ADR-001
move); `slavigrad-validate` updated to run build + test + lint + format; all three
DECIDEs recorded; status *Accepted*.
