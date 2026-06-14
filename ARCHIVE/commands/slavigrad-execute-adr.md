---
description: Execute an Accepted ADR's deletion/relocation inventory, one change-unit at a time, build-validated, staged for owner review. Destructive — runs only against an Accepted ADR.
agent: slavigrad-adr-executor
---

# Slavigrad — Execute ADR

Execute the inventory of ADR **{{adr}}** (e.g. `adr=002`), optionally limited to a single
row via {{row}} (e.g. `row=signal-crud`). Destructive but tightly gated: one revertible
unit at a time, build-checked, left staged for the owner to review and commit.

## Before doing anything

1. Read the cited ADR from folder ADR. Confirm **Status: Accepted**. If not, STOP.
2. Read the latest `docs/slavigrad-agentic/deadcode-report.md` and
   `validation-report.md`. Require a GREEN baseline. If the baseline is RED or stale,
   STOP and ask the owner to run `/slavigrad-validate label=baseline` first.
3. Confirm you are on a feature branch, not `main`. If not, STOP and ask to branch.
4. Note the testing reality: **Karma was removed, vitest is not configured, so there is
   no automated test gate.** The build is the only mechanical safety net — work in small
   units and hand off visual smoke to the owner after each.

## How to execute

Follow the executor agent's **Death Chains** ordering — refactor the consumer before
deleting the orphan. For ADR-002 specifically, the order is fixed:

1. **Service members first** (`cv-data.service.ts`): remove the dead/never-read members —
   search (`searchResults`, `_searchQuery`), content-strategy
   (`contentStrategy`/`filteredExperiences`/`filteredProjects`), `validationResult`,
   the CRUD block (`SignalCrudOps`/`createSignalCrud` instances + writer methods), and
   the `computedStatistics` computed. Build green. (Stats stay curated per ADR-002 #2 —
   do NOT replace them with derivation.)
2. **Now-orphaned utilities**: re-run knip to confirm `migrateLegacyExperience`,
   `applyContentStrategy`, `prepareDataForExport`, `generateComputedStats`,
   `calculateCompletenessScore`, `calculateDataQualityScore`, the `signal-crud.ts` file —
   have flipped to CONFIRMED DEAD, then delete. Build green.
3. **Pure dead leaves**: delete the symbols that were CONFIRMED DEAD from the start
   (`createChangeNotification`, `getAffectedComputedValues`, `generateSectionOrder`,
   `checkSchemaVersion`, `cloneCVData`, `mergeCVDataUpdates`, and the whole
   `ValidationSchema` engine + `generateSuggestions`). Build green.
4. **Interfaces**: once their only users are gone, remove the now-dead interfaces from
   `cv-data.interface.ts` (`DataChangeNotification`, `ContentStrategy`,
   `ValidationSchema`, `DataQualityScore`, schema-version fields, legacy `Experience`
   fields). Build green.

For ADR-004, after ADR-002: delete `SignalStateService` (+ its half of
`signal-models.ts`), `BundleAnalyzerService`, `CacheService`, the dead preloading
strategies (`NetworkAware*`, `Selective*`), `IntervalManager`, and `public/sw.js`;
remove their `app.config.ts` provider registrations; keep `CustomPreloadingStrategy`.
`PerformanceService`/`ImageOptimizationService`/`performance-monitor` only once their
ADR-004 DECIDEs are recorded.

For ADR-003: `git mv` `collapse-demo` and the kept experiments into `lab` (once the
`domains/` structure exists — coordinate with the ADR-001 move), delete
`modern-lifecycle`, drop the `modern/index.ts` barrel.

## Per-unit loop (the executor enforces this)

clean tree → make one change → `npm run build` (green) → `npx knip` (confirm) → log →
**stop, staged for review**. Build RED that an obvious fix won't cure → revert the unit,
report the blocker.

## Hard stops

- Never delete a LIVE/AMBIGUOUS symbol before the refactor that orphans it.
- Never touch `styles.css` or glass tokens. Never `git commit`/`push`. Never run
  `npm test` (it's gone). Never exceed ADR {{adr}}'s inventory.
- Found dead code outside the ADR? Log it as a finding; do not delete it.

## Output

The executor appends one entry per unit to
`docs/slavigrad-agentic/execution-log.md`, and leaves all changes staged but
uncommitted. End your run with a short summary: units done, current build status, and
the exact routes the owner should smoke-test before committing.
