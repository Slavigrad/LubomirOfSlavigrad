---
description: Plan and (on request) implement a new read-only tool on the local zero-dependency MCP servers in tools/mcp/ (default target: slavigrad-memoir). Plans first; implements only when asked. Verifies with the smoke test. No commit/push.
agent: slavigrad-mcp-builder
---

# Slavigrad — Build MCP Tool

Plan or extend a read-only MCP tool for: {{topic}}
(omit `{{topic}}` to be asked what tool to add.)

Use the `slavigrad-mcp-builder` agent. Default target is the memoir MCP at
`tools/mcp/slavigrad-memoir-mcp/`; if `{{topic}}` clearly concerns a different dataset,
say so and propose a separate zero-dependency MCP under `tools/mcp/` instead of bolting
it on.

## Steps

1. Load the `slavigrad-mcp-authoring` skill and read the existing server first
   (`src/index.mjs`, `src/data.mjs`, `README.md`). Reuse the data layer; never duplicate
   parsing.
2. **Deliver a plan** before any edit:
   - Tool `name` (snake_case) and `description` (state "Read-only.").
   - `inputSchema` (JSON Schema: `type: "object"`, `properties`, `required`,
     `additionalProperties: false`).
   - The pure data-layer function it needs and the output shape it returns.
   - Where it is registered (the `TOOLS` array in `src/index.mjs`).
   - How it will be tested (which assertion is added to `src/smoke-test.mjs`).
3. **Implement only if asked.** When implementing, follow the skill's checklist exactly,
   keep **zero dependencies**, keep the dataset **read-only**, and log only to `stderr`.
4. **Verify** and report the result:
   `node tools/mcp/slavigrad-memoir-mcp/src/smoke-test.mjs` (exit 0 = PASS). Confirm the
   MCP is still registered in `opencode.json`.

## Hard rules

- Read-only data: nothing you write may mutate, delete, or rewrite a dataset/source file.
- Zero dependencies; pure Node ≥ 22 only. No MCP SDK, no runtime deps.
- `stdout` carries MCP messages only; logs go to `stderr`.
- Run `git status` before and `git diff` after. Do NOT `git add`, `commit`, or `push`.
- Do not generate CV JSON from the `.ts` data files; a CV MCP is a separate future task.

## Definition of done

A plan is delivered (and, if requested, the tool is implemented and the smoke test is
green). No dependency added, dataset untouched, nothing committed.
