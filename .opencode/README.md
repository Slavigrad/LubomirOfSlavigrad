# Slavigrad OpenCode — Agentic Ecosystem

> **Status:** Phase 0 complete (inspection), ADR executables pending.
> All 5 ADRs accepted. Most cleanups executed. See `ARCHIVE/ADR/` for full text.

## Files

```text
.opencode/
  commands/slavigrad-inspect-angular-architecture.md   # the workflow
  agents/slavigrad-angular-architect.md                # read-only architect (no write/edit/bash)
  skills/slavigrad-angular-architecture/SKILL.md        # repo-specific knowledge + ADR decisions
```

## Install

Copy the `.opencode/` folder into the root of the Slavigrad repo (next to
`package.json`). Adjust frontmatter keys if your OpenCode version names them
differently (e.g. `mode`, `tools`, `agent`).

## Run

```text
/slavigrad-inspect-angular-architecture topic=whole-app
```

It writes `docs/slavigrad-agentic/angular-architecture-map.md`. Read that map,
then sanity-check it against reality: are the cited paths real? Is the
bounded-context import check answered? Is the stats-diff table filled in?

## Known repo facts (inspect command also encodes these)

- Angular **22.0.1** (migration complete). Build `ng build`
  (`@angular/build:application`); output `dist/LubomirOfSlavigrad/browser`.
- Tests **Vitest** (`@analogjs/vitest-angular` + jsDOM); `npm test` works.
- Lint **wired** — `npm run lint` runs ESLint flat config + angular-eslint + Sheriff.
- Two bounded contexts (cv, memoir) + shared + shell + lab per ADR-001/003.
  Domain restructure complete. Sheriff configured but permissive.
- Architecture rules documented in `ARCHIVE/ADR/` (ADR-001 through ADR-005, all Accepted).

## Open items

- `modern-lifecycle` (ADR-003: DELETE) still exists in `domains/lab/`
- Sheriff rules permissive (`'*': '*'`) — not yet enforced
- ImageOptimizationService unwired (ADR-004: KEEP but no consumer)
- Zoneless migration pending (currently `provideZoneChangeDetection`)
- Empty legacy `src/app/shared/` dir (`.DS_Store` only)

## What comes next (not built yet)

- `slavigrad-measure-deadcode` — runs knip/ts-prune, emits a report.
- `slavigrad-validate` — `ng build` + lint + test; the harness every later phase needs.
- `slavigrad-execute-adr` — executes remaining ADR cleanup items against an Accepted ADR.
