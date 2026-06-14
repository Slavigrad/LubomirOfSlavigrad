---
description: Universal Angular 22 safety harness. Builds the app, runs tests, lints, and checks formatting using the project's real scripts, then reports green/red. Run before starting any work (baseline) and after every change. Decision-independent — safe to run anytime.
agent: slavigrad-mechanical-worker
---

# Slavigrad — Validate

Verify the repo is in a known-good state. This is the gate every change is checked
against; run it once **before** any change too, to capture a baseline. Non-destructive:
it compiles, tests, lints, and inspects — it changes no code. It is universal: discover
the real commands from `package.json`; never assume a runner or a missing gate.

Optional arg `{{label}}` — a tag for the report (e.g. `baseline`, `after-feature-x`).

## Steps

1. **Discover the gates.** Read `package.json` `scripts` and identify the real commands
   for build, test, lint, and format-check. Use those exact scripts. If a gate has no
   script, report it as `NOT WIRED` (do not invent one).
2. `git rev-parse --abbrev-ref HEAD` and `git status` — record branch and working-tree
   state. If the tree is dirty and this run is a *baseline*, note it (a baseline should
   normally be clean).
3. **Build** (e.g. `npm run build`) — the primary gate. Capture exit status and, on
   failure, the exact compiler error(s) with file paths.
4. **Test** (the project's test script, run once / non-watch — e.g. `npm test`). Report
   the actual passed/failed counts; if the suite is small, say so — do not imply broad
   coverage from a green run.
5. **Lint** (e.g. `npm run lint`) if a lint script exists. Report pass/fail with the real
   errors. Do NOT auto-fix (never `--fix` here).
6. **Format check** (e.g. `npm run format:check` / `prettier --check .`) — drift only.
   Report the count of files that would change. Do NOT auto-fix (never `--write`).
7. **Visual smoke (manual handoff):** you cannot see rendered output. List the app's real
   routes (read them from the route files) for the owner to eyeball, and state that visual
   confirmation is the owner's step. Never claim the UI "looks fine".

## Honesty

- Report each gate by its real status. If lint/test/format is wired, run it and report the
  result; if a gate genuinely has no script, say `NOT WIRED` — never report a gate as
  passed without running it, and never claim a gate is missing without checking
  `package.json`.
- GREEN means: build OK + tests pass + lint clean + format clean (for every gate that is
  wired). Anything else is RED, reported with the real error.

## Output

Write `docs/slavigrad-agentic/validation-report.md` (overwrite per run; include the
`{{label}}` and timestamp). Structure:

```md
# Validation Report — {{label}} — <timestamp>

- Branch: <branch>    Working tree: clean | dirty (<n> files)
- Build: OK | FAILED  (errors below if failed)
- Tests: <passed> passed / <failed> failed  (note coverage size)
- Lint: clean | <n> problems | NOT WIRED
- Format: clean | <n> files would change | NOT WIRED
- Visual smoke: owner to confirm <real routes from the route files>

## Verdict
GREEN | RED — <one line>

## Details
<raw errors / failing files, only if not green>
```

## Definition of done

Report written; verdict is GREEN or RED with real evidence from the project's actual
scripts; no application file changed (`git status` shows only the report, if anything).
