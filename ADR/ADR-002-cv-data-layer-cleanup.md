# ADR-002: Removal of Speculative Machinery from the CV Data Layer

- **Status:** Proposed (each DELETE/REPLACE item requires individual owner approval; DECIDE items require an owner decision before execution)
- **Date:** 2026-06-12
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
| `groupSkillsByCategory` + `getColorForCategory` | **DECIDE** | Imported but bypassed (finding 2). Option A *(recommended)*: wire it in — `skillsByCategory` derives from `_skills`, and the redundant pre-grouped `CV_DATA.skillCategories` is deleted from the data file (one source of truth). Option B: keep static categories, delete the function. Keeping both is the only wrong answer. |
| `generateComputedStats` | **DECIDE** | Same pattern as above versus static `CV_DATA.stats`. Recommended: derive stats, delete the static copy. Note the static copy may contain hand-curated display text the derivation can't produce — check before choosing. |
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

After the above: remove the computed signals `validationResult`, `qualityMetrics`, `completenessScore`, `filteredExperiences`, `filteredProjects`; remove `_contentStrategy` and `_dataChangeNotifications`. **DECIDE:** `searchResults` + `_searchQuery` — no search UI was found; delete with the rest, or keep only if a search feature is actually planned. **DECIDE:** the `SignalCrudOps` add/update/delete machinery — the CV is edited in source files, not at runtime; if no admin-editing feature is planned, the CRUD layer goes too, which substantially simplifies the service. The service that remains is what ADR-001 calls the domain facade: readonly signals over static content plus genuinely derived computeds.

---

## Verification Gate (mandatory, before any deletion)

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

Done when: every inventory row is executed or explicitly re-verdicted; `knip` reports no unused exports in `domains/cv/data/`; `cv-data.spec.ts` exists and asserts the retained business rules against `CV_DATA`; build, lint, and visual smoke pass; this ADR's status is *Accepted* with all DECIDE items resolved and recorded.
