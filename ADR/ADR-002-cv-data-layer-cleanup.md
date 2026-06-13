# ADR-002: Removal of Speculative Machinery from the CV Data Layer

- **Status:** Accepted (2026-06-13) — all DECIDE items resolved; **item #2 (stats) revised** by the Phase 0 stats-diff check (see below)
- **Date:** 2026-06-12 (proposed), 2026-06-13 (accepted)
- **Deciders:** Lubomir (owner), Claude (analysis)
- **Depends on:** ADR-001 (the surviving code becomes `domains/cv/data/`)
- **Scope:** `src/app/models/cv-data.utils.ts`, `src/app/models/cv-data.validators.ts`, and the parts of `cv-data.service.ts` and `cv-data.interface.ts` that exist only to serve them. Out of scope: `/demo` route and performance services (ADR-003/004).

---

## Context

The CV data layer exhibits **speculative generality** (Fowler): infrastructure built for consumers, features, and failure modes that do not exist in this application. The application renders one hand-authored CV from static TypeScript files. There is no backend, no user input into the CV model, no PDF export, no analytics pipeline, and no second consumer.

Three findings drive this ADR:

**1. The dependency chain hides dead code.** Components consume `CvDataService`; the service imports nearly every function from `cv-data.utils.ts` and `cv-data.validators.ts` and wraps them in computed signals (`validationResult`, `qualityMetrics`, `completenessScore`, `filteredExperiences`, `searchResults`, …). No component was found consuming most of these signals. An import keeps code compiling; only a consumer keeps it alive. Dead service-level signals transitively keep dead utility functions "in use".

**2. Some "live" code is actually bypassed.** Verified in `cv-data.service.ts`: `skillsByCategory = computed(() => CV_DATA.skillCategories)` returns *static pre-grouped data*, while the imported `groupSkillsByCategory` (which would derive categories from the skills list) goes unused on that path. The same pattern appears with `stats` (served from static `CV_DATA.stats`) versus the imported `generateComputedStats`. This is a single-source-of-truth violation: derived data is stored *and* computable, and the two can drift.

**3. One function is a latent bug.** `cloneCVData` uses `JSON.parse(JSON.stringify(data))`, which silently converts every `Date` into a `string`. Any code path that clones and then calls `.getTime()` breaks.

A note on epistemics: the analysis below is based on retrieval over the project sources, which is strong evidence but not a compiler. Therefore **no deletion is executed on the basis of this document alone** — see the Verification Gate.

---

## Decision

Apply the following inventory. Verdicts: **KEEP** (genuine domain logic), **DELETE** (speculative, no real consumer), **REPLACE** (need is real, mechanism is wrong), **DECIDE** (owner must choose between two coherent options).

### `cv-data.utils.ts`

| Item | Verdict | Rationale |
|---|---|---|
| `calculateTotalExperience` + `getMonthsDifference` | **KEEP** | Real, subtle domain logic: merges overlapping employment periods so concurrent jobs don't double-count years. The heart of the CV domain. |
| `computeOverallExperienceDates` | **KEEP** | Used by `calculateTotalExperience` and current-position detection. |
| `extractAllTechnologies` | **KEEP** | Live via `allTechnologies` computed; genuine derivation. |
| `groupSkillsByCategory` + `getColorForCategory` | **RESOLVED → DERIVE, conditional** | Owner decision: derive (single source of truth). **Phase 0 precondition:** the static `skillCategories` carry curated data the function does *not* produce — display names ("Programming Languages" vs the raw `skill.category` value "programming"), icons, descriptions, and explicit `display_order`. Deriving the *grouping* is safe; the *labels/icons/order are curated content* and must first move into the skills data model, or they are lost. Sequence: (1) enrich skill/category data with display name + icon + description + order, (2) point `skillsByCategory` at the derived function, (3) delete the static `CV_DATA.skillCategories`. If the owner declines the data-model enrichment, fall back to keeping curated categories and deleting the function. |
| `generateComputedStats` | **RESOLVED → DELETE (do NOT derive)** | **Reversed by Phase 0 stats-diff check.** The static stats are *claims*, not counts: `"150+"` projects (data file has 2 active entries), `"12+"` teams and `"50+"` systems (no backing field exists), `"∞"` coffee (a joke). Derivation would replace curated headline claims with smaller literally-true numbers — destroying content, not enforcing a single source of truth. The function and the `computedStatistics` computed are unused anyway (the `Stats` component reads `totalExperienceYears`/`totalSkills` directly). **Stats remain curated in the data file** — which already is one editable home. Only `stat-experience` `"20+"` is borderline-derivable (`Math.floor(years)+'+'`); keeping it curated for consistency is the recorded choice. See revised reasoning under "Stats: fact vs. claim" below. |
| `migrateLegacyExperience` | **DELETE** | Simulates a database migration system for a TS file edited by hand. Correct fix: edit the data file into the current shape once, then delete the migrator and the legacy fields it exists for. |
| `createChangeNotification`, `getAffectedComputedValues` | **DELETE** | A hand-rolled change-propagation bus declaring consumers (`'pdf'`, `'analytics'`) that don't exist. Angular signals *are* the change propagation; `computed()` already knows what to recalculate. Cascades: `_dataChangeNotifications` signal and `notifyDataChange` in the service, the notification callback parameter in `shared/utils/signal-crud.ts`, and the `DataChangeNotification` interface. |
| `applyContentStrategy`, `generateSectionOrder` | **DELETE** | Content-personalization engine; `_contentStrategy` defaults to `null` and no UI sets it, so `filteredExperiences`/`filteredProjects` always collapse to the unfiltered lists. Cascades: those two computed signals, the `_contentStrategy` signal, the `ContentStrategy` interface. |
| `prepareDataForExport` | **DELETE** | The `'pdf'` and `'html'` branches are empty stubs; the `'json'` branch is `{...data}` with deletions. If a real export feature arrives later, it will be a `feature-export` with its own design (per ADR-001). |
| `checkSchemaVersion` + `CURRENT_SCHEMA_VERSION` + `data_schema_version` field | **DELETE** | Schema versioning for data that has no schema evolution problem — it's source code; git is its version history. |
| `cloneCVData` | **DELETE** | Finding 3: destroys `Date` objects. Where a clone is genuinely needed, use `structuredClone()`. |
| `mergeCVDataUpdates` | **DELETE** | Shallow merge wrapper around spread; no verified caller. |

### `cv-data.validators.ts`

| Item | Verdict | Rationale |
|---|---|---|
| Entire `ValidationSchema` engine: `validateAgainstSchema`, `validateConstraints`, `getFieldType`, `PERSONAL_INFO_SCHEMA`, `EXPERIENCE_SCHEMA`, `PROJECT_SCHEMA` | **REPLACE** | A hand-maintained, `any`-typed runtime validation framework re-checking what the TypeScript compiler already guarantees about statically-typed source data. Replacement principle: **validation of hand-authored static content belongs in a unit test, not in runtime computed signals.** One spec file (`cv-data.spec.ts`) asserts the few real business rules against `CV_DATA` at test time; the build fails if the data is bad, and zero validation code ships to the browser. |
| Date-order rule inside `validateExperience` (end ≥ start) | **KEEP** (relocated) | The one genuine business rule in the file. Becomes a test assertion. Same for the email-format check if desired. |
| `calculateCompletenessScore`, `generateSuggestions` | **DELETE** | Self-coaching suggestions ("add more projects") computed about the owner's own hand-written CV, with no UI consumer found. |
| `calculateDataQualityScore` | **DELETE** | Contains `consistency = 85; // Placeholder` — a hardcoded fake metric — and a `timeliness` score that decays 2 points per day, guaranteeing a static site reports ever-worsening "quality". A fake metric is worse than no metric. |

### `cv-data.service.ts` (cascade, informative)

After the above: remove the computed signals `validationResult`, `qualityMetrics`, `completenessScore`, `filteredExperiences`, `filteredProjects`; remove `_contentStrategy` and `_dataChangeNotifications`. **RESOLVED → DELETE:** `searchResults` + `_searchQuery` — owner decision; no search UI exists and the Phase 0 map confirmed no consumer. **RESOLVED → DELETE:** the entire `SignalCrudOps` add/update/delete machinery (and `importCVData`/`updatePersonalInfo`/`setContentStrategy` writers) — owner decision: the CV is edited in source files, not at runtime, and no in-browser editor is planned; git is the editor. This collapses `cv-data.service.ts` into a read-only facade and removes the change-notification system's only caller. The service that remains is what ADR-001 calls the domain facade: readonly signals over static content plus genuinely derived computeds (`allTechnologies`, `totalExperienceYears`, `totalCompanies`, `skillsByCategory` once derived). **Phase 0 also flagged** `SignalStateService` (registered in `app.config.ts`, consumed by nothing) and the unused `computedStatistics` computed — both fall out with this cleanup; `SignalStateService`'s provider registration is tracked further in ADR-004.

---

## Stats: fact vs. claim (revision rationale, 2026-06-13)

The original ADR said "derive stats" under the single-source-of-truth principle. The Phase 0 stats-diff check, run against the real data files, showed this was wrong — and the reason generalizes into a principle worth stating:

> **Single source of truth applies to facts, not to claims.** A *fact* is mechanically determined by the data (how many skills are in the list, the span between two dates). A *claim* is an authored editorial statement about oneself (a headline "150+ projects" spanning a whole career, "∞ coffee"). Facts should derive — storing them invites drift. Claims are content; their single home is the data file, and that already satisfies "one place to change." You do not *compute* a headline.

Evidence from the check: static `"150+"` projects vs **2** active entries in `projects-data.ts`; `"12+"` teams and `"50+"` systems with no backing field; `"∞"` coffee. Deriving these would not enforce truth — it would delete curated content and substitute weaker literal numbers.

Consequence for the data model: stats stay as authored values in the data file. The genuine *facts* the service already derives correctly (`totalExperienceYears`, `totalCompanies`, `allTechnologies`) remain derived and available, but they are not forced to *overwrite* the curated headline stats. Where a curated stat and a derived fact happen to coincide (e.g. experience years), the curated value wins for presentation; the derived value stays available for any place that wants the live number. This is the same fact/presentation split applied to skills (#1): derive the grouping, declare the labels.

---



1. Run mechanical dead-code analysis on the real repo: `npx knip` (or `ts-prune`) plus `grep -rn "<symbol>" src/` for every DELETE item. A symbol is deletable only when its callers are all inside the deletion set.
2. Resolve all DECIDE items with the owner; record the choices by updating this ADR.
3. Execute in dependency order (leaf utilities last, service wiring first), **one inventory row per commit**, running `ng build && ng lint` + visual smoke (/, /egypt-story) after each.
4. Any symbol with an unexpected live caller is moved from DELETE to DECIDE, not force-deleted.

**Sequencing:** execute after the Angular 22 migration (Phase 1) and before the restructure move (Phase 4) — there is no point migrating or relocating code that is about to be deleted, and pure moves are easiest when the survivors are known.

---

## Considered alternatives

**A. Relocate everything as-is into `domains/cv/data/`.** Rejected. Professional rigor is matching code to the actual problem, not giving impressive-looking code a tidy address. Carrying ~600 lines of dead framework into the new structure launders it as intentional.

**B. Keep the runtime validation engine "because validation is good practice".** Rejected. The practice is sound for *untrusted runtime input* (forms, APIs). This data is compile-time-typed source code; the compiler validates structure for free and a unit test covers the business rules. If untrusted input ever appears (e.g. a contact form posting to a backend), introduce Zod *at that boundary* — not a hand-rolled schema engine in the domain core.

**C. Delete in one big commit.** Rejected. One row per commit keeps every step revertible and reviewable — the same small-batch discipline as the rest of the phase plan.

---

## Consequences

**Positive:** the CV data module shrinks to its genuine domain logic (experience math, technology/skill derivation) plus content — an honest model instead of an anemic one wrapped in fake infrastructure; the restructure move (ADR-001) gets materially smaller; two latent bugs (`cloneCVData` date destruction, decaying quality score) are removed; `cv-data.interface.ts` loses the interfaces that existed only for deleted machinery (`DataChangeNotification`, `ContentStrategy`, `ValidationSchema`, `DataQualityScore`, schema-version fields, legacy `Experience` fields).

**Negative / costs:** if a PDF-export or CV-editing feature is genuinely wanted later, parts get rebuilt — deliberately accepted, because rebuilding against a real requirement produces better code than preserving a guess (YAGNI). The deletion phase adds roughly a dozen small commits and the one-time setup of `knip`/`ts-prune`.

## Compliance check

Done when: every inventory row is executed or explicitly re-verdicted; `knip` reports no unused exports in `domains/cv/data/`; stats remain curated in the data file (the derivation path `generateComputedStats`/`computedStatistics` is removed) and skill categories are either derived-after-data-enrichment or kept curated per the resolved #1 choice; `cv-data.spec.ts` exists and asserts the retained business rules against `CV_DATA`; build and visual smoke pass (lint once wired — ADR-005); this ADR's status is *Accepted* with all DECIDE items resolved and recorded. **(Status: Accepted 2026-06-13.)**
