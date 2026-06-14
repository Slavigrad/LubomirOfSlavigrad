---
description: Evidence-gatherer for the ADR-002 / ADR-004 verification gates. Runs knip + ts-prune, cross-checks against ADR deletion lists, and reports which symbols are provably unused. Read-only on src/ — produces a report, deletes nothing.
agent: slavigrad-mechanical-worker
---

# Slavigrad — Measure Dead Code

Produce mechanical evidence of unused files, exports, and dependencies, so the
ADR-gated deletions can proceed on facts instead of inference. **This command deletes
nothing.** It turns "I think this is dead" into "the tool confirms this is dead."

## Why this exists

ADR-002 and ADR-004 list code to delete, but those verdicts came from reading and
grep. The Verification Gate in each ADR requires tool confirmation before any symbol is
removed: *a symbol is deletable only when all its callers are inside the deletion set.*
This command supplies that confirmation.

## Steps

1. `npx knip` — primary. Reports unused files, unused exports, and unused dependencies.
   If it needs a one-off install via `npx`, allow it (does not mutate `package.json`).
2. `npx ts-prune` — cross-check for unused exports (confirms what knip reports).
   Where the two disagree, report both and mark the symbol `NEEDS MANUAL GREP`.
3. For each symbol on the ADR deletion lists below, run a targeted
   `grep -rn "<symbol>" src/` and record every caller. Classify:
   - `CONFIRMED DEAD` — no callers, or all callers are themselves on a deletion list.
   - `LIVE CALLER` — at least one caller outside the deletion set → **do not delete**;
     flag for re-verdict (move to a DECIDE in the ADR).
   - `AMBIGUOUS` — dynamic/string reference, template usage, or DI-only → manual review.

## ADR deletion lists to verify (cite the source ADR per finding)

**ADR-002 (CV data layer):** `migrateLegacyExperience`, `createChangeNotification`,
`getAffectedComputedValues`, `applyContentStrategy`, `generateSectionOrder`,
`prepareDataForExport`, `checkSchemaVersion`, `cloneCVData`, `mergeCVDataUpdates`,
`calculateCompletenessScore`, `generateSuggestions`, `calculateDataQualityScore`, the
`ValidationSchema` engine (`validateAgainstSchema`, `validateConstraints`, `getFieldType`,
`PERSONAL_INFO_SCHEMA`, `EXPERIENCE_SCHEMA`, `PROJECT_SCHEMA`), service members
`searchResults`/`_searchQuery`, the `SignalCrudOps`/`*Crud` machinery, and the
`generateComputedStats`/`computedStatistics` derivation path (stats stay curated).

**ADR-004 (services):** `SignalStateService` (+ its half of `signal-models.ts`),
`BundleAnalyzerService`, `CacheService`, and — pending their DECIDEs —
`ImageOptimizationService`, `PerformanceService`. Confirm `CustomPreloadingStrategy` is
the ONLY one with a live consumer (the router). Also check whether
`shared/utils/interval-manager.ts` has any caller (sweep candidate if `performance-monitor`
is deleted).

## Honesty

- Report which tool produced each number (knip vs ts-prune). If knip is unavailable,
  say so and rely on ts-prune + grep.
- A symbol that is exported and imported but whose *importer is itself dead* is still
  dead — follow the chain, and say how deep you followed it.
- Templates and DI tokens don't show up in export analysis; the targeted greps must
  include `.html` files. Note any symbol used only in a template.
- Do not state a symbol is safe to delete if it's `AMBIGUOUS`.

## Output

Write `docs/slavigrad-agentic/deadcode-report.md`:

```md
# Dead Code Report — <timestamp>

## Tooling
knip: <version/available?>   ts-prune: <available?>

## knip summary
unused files: <n>   unused exports: <n>   unused deps: <list>

## ADR-002 verification
| Symbol | Tool says | Callers found | Classification | Source ADR |
| ... | ... | ... | CONFIRMED DEAD / LIVE CALLER / AMBIGUOUS | ADR-002 |

## ADR-004 verification
| Service/symbol | Consumers found | Classification | Source ADR |

## Surprises
Anything dead that no ADR mentions yet (candidate for a new finding).

## Anything flagged LIVE CALLER or AMBIGUOUS
Explicit list — these block their ADR row until re-verdicted by the owner.
```

## Definition of done

Report written; every ADR-listed symbol classified with its callers; no file under
`src/` modified; LIVE/AMBIGUOUS items called out so the owner knows exactly what is NOT
yet safe to delete.
