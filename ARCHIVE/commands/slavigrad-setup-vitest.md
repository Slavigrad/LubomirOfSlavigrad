---
description: Implement ADR-005 #1 — establish vitest as the test runner, migrate the existing specs, finish removing Karma, and restore an automated test gate. Runs before the ADR-002 deletion program so destructive work has tests behind it.
agent: slavigrad-adr-executor
---

# Slavigrad — Set Up Vitest (ADR-005 #1)

Restore an automated test gate by standing up **vitest**. This is the first thing the
ADR program needs: it converts `slavigrad-validate` from "build only" back into
"build + test", which is what makes the ADR-002/003/004 deletions safe.

Destructive (edits config + specs), so the executor's rules apply: small units, build
green after each, staged for owner review, never committed.

## Preconditions

1. ADR-005 is at least Proposed and the owner has chosen the integration path (DECIDE
   D1) — OR you are authorized to detect-and-recommend it (default).
2. Green build baseline exists. If not, run `/slavigrad-validate label=baseline` first.
3. On a feature branch, not `main`.

## Step 0 — reconcile reality (do this before changing anything)

The repo's runner state has been observed mid-migration and the two snapshots disagree,
so **trust the disk, not assumptions**. Determine and report:

- Is Karma still present? (`grep -i karma package.json angular.json`; is there a
  `@angular/build:karma` test builder block?)
- Is vitest installed? (`grep vitest package.json`) Is there a `vitest.config.*`?
- How many real specs exist? (`grep -rl "describe(" src/`) What matcher style — Jasmine
  (`jasmine.createSpy`, `spyOn`) or already vitest?
- Which Angular 21 minor is installed, and does it support the native
  `@angular/build:unit-test` vitest builder, or is `@analogjs/vitest-angular` the right
  path? (DECIDE D1 — report findings, recommend one, proceed only on the chosen path.)

Write this as the first section of the setup log before editing. If reality contradicts
this command's assumptions, follow reality and note the divergence.

## Step 1 — install/confirm vitest deps (unit: deps)

Ensure `vitest`, `@vitest/coverage-v8`, `jsdom`, and the chosen Angular integration are
in devDependencies. NOTE: installing deps mutates `package.json`/lockfile, which is
normally outside the executor's allow-list — this command **explicitly authorizes**
`npm install -D <pkgs>` for the test tooling only, and the owner reviews the lockfile
diff. Nothing else in the allow-list relaxes.

## Step 2 — vitest config (unit: config)

Create `vitest.config.ts` with the `jsdom` environment, Angular-aware setup (zone or
zoneless per the project's `app.config.ts`; this project uses zone — keep
`zone.js/testing` setup until a separate zoneless decision), and a `test-setup.ts` if the
integration requires it. Build must still pass (config doesn't affect build, but confirm).

## Step 3 — wire scripts (unit: scripts)

In `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`,
`"test:coverage": "vitest run --coverage"`. Do not yet remove Karma scripts — that's
Step 5, after vitest is green.

## Step 4 — migrate the existing specs (one unit PER spec)

For each existing `.spec.ts` (there are ~3; confirm the count from Step 0):
- Add `import { describe, it, expect, vi, beforeEach } from 'vitest';` as needed.
- `jasmine.createSpy()` → `vi.fn()`; `spyOn(x,'y').and.returnValue(z)` →
  `vi.spyOn(x,'y').mockReturnValue(z)`; `.calls.count()` → `.mock.calls.length`, etc.
- Angular `TestBed`/`ComponentFixture` usage is unchanged.
- After each spec: `npm test` (vitest) on that file MUST pass. One spec = one unit = one
  staged change.

If a legacy spec tests something ADR-002/003/004 is about to delete (e.g. a spec for
`performance-monitor` or a CRUD method), do NOT invest in migrating it — note it, and let
it be removed with its subject during execution. Migrate only specs whose subject
survives.

## Step 5 — remove Karma (unit: karma-removal)

Once vitest runs green: remove `karma*`, `jasmine-core`, `@types/jasmine` from
devDependencies; delete the `test` builder block from `angular.json`; delete any
`karma.conf.*` and `test.ts` zone-testing entry that vitest replaced. `npm run build`
green; `npm test` (vitest) green.

## Step 6 — add a thin characterization spec (unit: char-tests) — recommended

Before the deletions run, add minimal tests over the domain logic ADR-002 KEEPS, so a
bad deletion is caught:
- `CvDataService` (or `cv-data.utils`): assert `calculateTotalExperience` on overlapping
  periods (the subtle one), `groupSkillsByCategory`, `extractAllTechnologies`.
- A render smoke test for `/` and `/egypt-story` (component mounts without error).
These are the tests that turn the executor's "runtime NOT verified" caveat into
"verified". Keep them small and behavioral, not implementation-coupled.

## Per-unit loop & output

clean tree → change → `npm run build` green → `npm test` green → log → stop, staged for
review. Append each unit to `docs/slavigrad-agentic/execution-log.md` under a
`## ADR-005 #1 vitest setup` heading, including the Step 0 reconciliation findings and
the D1 path chosen.

## Hard stops

- Detect-and-report before editing; if disk contradicts assumptions, follow disk.
- `npm install -D` is authorized for TEST TOOLING ONLY; no other dependency changes.
- Don't migrate specs for soon-to-be-deleted code.
- Never touch `styles.css`/glass tokens. Never commit/push.
- End by telling the owner: vitest green Y/N, Karma removed Y/N, which routes/logic now
  have characterization coverage, and that `slavigrad-validate` can now re-enable its
  test step.
