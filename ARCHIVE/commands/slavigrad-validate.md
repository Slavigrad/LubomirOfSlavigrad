---
description: Safety harness for Slavigrad. Builds the app, runs tests headless, checks formatting, and reports green/red. Run before starting destructive work (baseline) and after every change. Decision-independent — safe to run anytime.
agent: slavigrad-mechanical-worker
---

# Slavigrad — Validate

Verify the repo is in a known-good state. This is the gate every later (destructive)
phase calls **after each change**; run it once **before** any change too, to capture a
baseline. Non-destructive: it compiles, tests, and inspects — it changes no code.

Optional arg `{{label}}` — a tag for the report (e.g. `baseline`, `after-adr002-row3`).

## Steps

1. `git rev-parse --abbrev-ref HEAD` and `git status` — record branch and working-tree
   state. If the tree is dirty and this run is a *baseline*, note it (the baseline
   should normally be clean).
2. `npm run build` — the primary gate. Capture exit status and, on failure, the exact
   compiler error(s) with file paths.
3. `npm test -- --watch=false --browsers=ChromeHeadless` — run the Karma/Jasmine suite
   once. Note: very few specs exist today, so a pass here is weak evidence; report the
   actual passed/failed counts, do not imply broad coverage.
4. `npx prettier --check .` — formatting drift only. Report count of files that would
   change. Do NOT auto-fix.
5. **Visual smoke (manual handoff):** you cannot see rendered output. List the routes the
   owner should eyeball — `/`, `/egypt-story`, `/demo` (until ADR-003 relocates it),
   `/404` — and state that visual confirmation is the owner's step. Never claim the UI
   "looks fine".

## Honesty

- **Do not run `ng lint`** and **do not report lint status** — lint is not wired in this
  repo (ADR-005). The build is the gate. Say this explicitly in the report so no one
  mistakes a green build for a green lint.
- Green means: build OK + tests pass + format clean. Anything else is RED, reported with
  the real error.

## Output

Write `docs/slavigrad-agentic/validation-report.md` (overwrite per run; include the
`{{label}}` and timestamp). Structure:

```md
# Validation Report — {{label}} — <timestamp>

- Branch: <branch>    Working tree: clean | dirty (<n> files)
- Build: OK | FAILED  (errors below if failed)
- Tests: <passed> passed / <failed> failed  (suite is small — weak coverage)
- Format: clean | <n> files would change
- Lint: NOT WIRED (no ESLint builder — see ADR-005); build is the gate
- Visual smoke: owner to confirm /, /egypt-story, /demo, /404

## Verdict
GREEN | RED — <one line>

## Details
<raw errors / failing files, only if not green>
```

## Definition of done

Report written; verdict is GREEN or RED with real evidence; no application file changed
(`git status` shows only the report, if anything).
