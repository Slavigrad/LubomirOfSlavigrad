# ADR-001: Two Bounded Contexts — `cv` and `memoir`

- **Status:** Proposed (becomes *Accepted* when Lubomir approves; restructure work must not begin before that)
- **Date:** 2026-06-12
- **Deciders:** Lubomir (owner), Claude (architecture analysis)
- **Technical story:** Restructure of the Slavigrad CV application from type-first layout (`components/`, `pages/`, `models/`, `services/`, `shared/`) to a domain-based architecture per *Modern Angular* (Steyer) and `advanced-modern-angular-application-structure-guide.md`.

---

## Context

The application is a standalone Angular app (currently v21, migration to v22 planned) serving a personal CV/portfolio site with a long-form memoir page. The current `src/app` layout is horizontal/type-first, which produces the known failure modes: three plausible homes for any component (`components/`, `pages/`, `shared/components/`), domain types split across `interfaces/` and `models/`, and no structural expression of what the application is about.

Before choosing a target structure, a domain analysis was performed using ubiquitous-language analysis: bounded contexts are identified by where the vocabulary changes.

### Evidence

**Vocabulary cluster 1 — CV:**
`Experience`, `Position`, `Skill`, `SkillCategory`, `Project`, `Certification`, `Education`, `PersonalInfo`, completeness score, total experience years.
Found in: `src/app/models/cv-data.interface.ts`, `cv-data.utils.ts`, `cv-data.validators.ts`, `src/app/data/cv-data.ts` (+ `experience-data.ts`, `projects-data.ts`, `skills-data.ts`), `src/app/services/cv-data.service.ts`, all six homepage section components under `src/app/components/`.

**Vocabulary cluster 2 — Memoir:**
`Story`, `Chapter`, `Section`, `NavigationChapter`, reading time, reading progress, `ShareConfig`.
Found in: `src/app/data/egypt-story-data.ts`, `egypt-memoir-structured.json`, `src/app/pages/egypt-story/egypt-story.component.ts`, `src/app/shared/components/{chapter-navigation, reading-progress, social-share, scroll-to-top}/`.

The two vocabularies share no terms. No file in cluster 1 imports a type from cluster 2 or vice versa. A `Chapter` is meaningless on the CV page; an `Experience` is meaningless in the memoir.

**Neither-domain code (technical / design system):**
Glassmorphism UI kit (`src/app/shared/components/ui/*`), design tokens (`glass-design.interface.ts`, `z-index.ts`, `tailwind.config.js`, `src/styles.css`), `theme.service.ts`, animation utilities, performance/cache/image services, lazy-image directive, preloading strategy.

**Single-consumer "shared" components (verified by import analysis):**
`reading-progress`, `chapter-navigation`, `social-share`, and `scroll-to-top` are each imported by exactly one component: `egypt-story.component.ts` (`home.component.ts` imports only the six CV section components). Under the rule *"shared only on demonstrated cross-domain reuse; promote on the third use"*, all four are memoir-local UI today, not shared.

---

## Decision

The application is structured as **two bounded contexts plus a technical shared area and a shell**:

```text
src/app/
  shell/                      # app frame: root component, nav, footer, 404
  domains/
    cv/
      cv.routes.ts            # public API of the domain (lazy-loaded)
      feature-overview/       # routed home page + its section components
      data/                   # model, validators, utils, CvDataService, static content
    memoir/
      memoir.routes.ts
      feature-story/          # egypt-story page
      ui/                     # reading-progress, chapter-navigation,
                              # social-share, scroll-to-top
      data/                   # story model + content
    shared/
      ui-glass/               # design-system components + glass design tokens
      ui-common/              # generic technical components (e.g. loading)
      util-performance/       # cache, image-optimization, lazy-image, preloading
      util-theme/             # theme.service.ts
```

### Module rules (to be enforced, not merely documented)

1. `cv` and `memoir` MUST NOT import from each other, in either direction.
2. Domains MAY import from `domains/shared/*`; `shared` MUST NOT import from any domain.
3. Within a domain: `feature → ui → data → util`; never the reverse.
4. A feature MUST NOT import from another feature.
5. Anything under an `internal/` folder is private to its module.
6. A domain's public API toward the application is its `*.routes.ts` (wired in `app.routes.ts` via `loadChildren`).
7. Code moves to `domains/shared` only on demonstrated use by both domains — never on anticipated reuse.

Rules 1–5 are enforced with **Sheriff** dependency rules from the first commit of the restructure (equivalent role to ArchUnit in a Spring modular monolith). A violation fails the build.

---

## Considered alternatives

**A. Single domain (`domains/portfolio/feature-*`).**
Rejected. The vocabulary analysis shows two disjoint languages with zero type-level coupling. Flattening them into one domain would erase a boundary that already exists in the code and would permit accidental coupling (e.g. memoir UI importing CV models) that nothing currently prevents.

**B. Keep type-first layout, improve naming only.**
Rejected. Does not address the "three homes per component" ambiguity, the `interfaces/` vs `models/` split, or the absence of enforceable boundaries.

**C. Full multi-app Nx monorepo.**
Rejected as premature. One deployable, one developer. The chosen structure scales to Nx libraries later without conceptual change (folders become libraries; Sheriff rules become Nx tags).

---

## Consequences

**Positive**

- Every file has exactly one correct home; "where does this go?" is answered by the matrix, not by taste.
- The memoir can evolve (more stories, new routes) without touching CV code, and vice versa.
- Lazy loading per domain falls out naturally from rule 6.
- Architecture violations are build failures, not code-review opinions.

**Negative / costs**

- One-time move of essentially every file under `src/app` (mitigated: moves are executed last in the phase plan, as pure moves with no content changes, one slice per run, validated after each slice).
- Sheriff is a new dev dependency and a new concept to learn.
- Slight ceremony for a small site — accepted deliberately as a learning objective.

**Deferred to follow-up ADRs (explicitly out of scope here)**

- **ADR-002:** Deletion of speculative machinery in `cv-data.utils.ts` / `cv-data.validators.ts` (change-notification system, schema versioning/migration, `ContentStrategy`, `DataQualityScore`, hand-rolled `ValidationSchema` engine) and replacement strategy for runtime validation. Requires owner approval per item.
- **ADR-003:** Fate of the `/demo` route and experimental components (`collapse-demo`, `modern-card`, `modern-lifecycle`, `signal-form`, `performance-monitor`): keep as a `shared/ui-glass` showcase feature, move behind a dev-only flag, or delete.
- **ADR-004:** Placement and necessity review of the performance service suite (`bundle-analyzer`, `performance.service`, `signal-state.service`) — several may be speculative.

## Compliance check

The restructure is considered complete when: the tree matches the structure above; Sheriff rules 1–5 are active and the build is green; `app.routes.ts` contains only shell routes plus two `loadChildren` entries; no import path crosses a forbidden boundary; and `ng build` + `ng lint` + visual smoke (/, /egypt-story, /404) pass.
