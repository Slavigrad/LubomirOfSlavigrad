# AGENTS.md

Project rules for AI coding agents (Claude Code, OpenCode, Codex, Cursor, etc.).
Keep this file short. Detail lives in the linked docs, not here.

## Stack

- **Angular 22** (signals-first, zoneless, standalone).
- TypeScript, modern Angular best practices only.

## Angular conventions (authoritative)

The project Angular docs in `angular-22-best-practices/angular-22-*.md` and
`angular-22-best-practices/advanced-modern-angular-application-structure-guide.md` are the source of
truth. They **OVERRIDE** any defaults from installed skills (including the
official `angular-developer` skill) wherever the two differ.

Before any Angular work:

1. Load `angular-22-best-practices/angular-22-best-practices.md` first — it is the router. Follow its
   "Document Map" table to load the specialized doc(s) for the task.
2. For application structure / where files belong, consult
   `angular-22-best-practices/advanced-modern-angular-application-structure-guide.md` before creating files.

## Version-specific rules (v22)

- **Forms:** Signal Forms (`@angular/forms/signals`) are the default for new
  forms. Use Reactive Forms only for existing code; template-driven is legacy.
- **Reactivity:** `resource`, `httpResource`, `rxResource`, and `debounced()`
  are stable in v22 — use them as documented in
  `angular-22-best-practices/angular-22-signals-reactivity.md`.
- **No legacy patterns** (NgModules, decorator inputs/outputs, structural
  directives, Zone.js assumptions) unless explicitly working in a legacy
  codebase.

## Skills

- `angular-developer` — loadable from `.opencode/skills/angular-developer/`.
  Useful for CLI scaffolding, code generation, and `ng build` validation.
  Also available to other tools at `.agents/skills/angular-developer/`.
- `slavigrad-angular-architecture` — loadable from
  `.opencode/skills/slavigrad-angular-architecture/`.

All skills defer to the project docs above on conventions and version-gated
features.

## Maintenance

Keep this file lean. Add a line only when it prevents a concrete, recurring
mistake. Push detail into the `angular-22-best-practices/angular-22-*.md` docs rather than restating it
here.
