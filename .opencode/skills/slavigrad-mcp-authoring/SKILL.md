---
name: slavigrad-mcp-authoring
description: Create and extend the local zero-dependency read-only MCP servers in tools/mcp/ (starting with slavigrad-memoir). Explains the MCP stdio JSON-RPC protocol, the zero-dependency pattern, and how to add a new read-only tool safely. Load whenever building or changing an MCP in this repo.
license: MIT
---

# Slavigrad MCP Authoring (zero-dependency, read-only)

How to work on the local MCP servers in `tools/mcp/`. The reference implementation is
`tools/mcp/slavigrad-memoir-mcp/`, which exposes the Egypt memoir
(`src/app/domains/memoir/data/egypt-memoir-structured.json`) read-only.

## Why zero dependency

These MCPs **do not use external dependencies** (not even the official SDK): the server
"starts with `node`, and that's it" — reproducible on any machine, no `npm install`, no
network. MCP over stdio is plain JSON-RPC 2.0, implemented by hand. If the official SDK
is ever wanted, the message shapes below map directly onto it; the default is zero-dep.

## MCP over stdio — protocol essentials

- **Newline-delimited JSON**, one message per line, no embedded newlines, UTF-8.
- **`stdout` carries MCP messages only.** Logs go to **`stderr`** (`process.stderr.write`
  / `console.error`). Never `console.log` to stdout — it corrupts the stream.
- `initialize` → respond `{ protocolVersion, capabilities: { tools: {} }, serverInfo }`.
  Echo back the client's requested `protocolVersion` when it sends one.
- `notifications/initialized` → a notification (no `id`); **do not respond**.
- `tools/list` → `{ tools: [{ name, description, inputSchema }] }` (`inputSchema` is JSON
  Schema: `type: "object"`, `properties`, optional `required`, `additionalProperties:false`).
- `tools/call` `{ name, arguments }` → `{ content: [{ type: "text", text }], isError? }`.
- Unknown method → JSON-RPC error `-32601`. Parse failure → `-32700`.
- A tool that throws → return `{ content: [...], isError: true }` (in-band), not a crash.

## Folder structure (per MCP)

```text
tools/mcp/<name>-mcp/
  package.json        # { "type": "module" }, scripts (start/check), no dependencies
  README.md           # what it is, tools table, how to run and smoke-test
  src/data.mjs        # read-only loader + PURE query functions (no I/O side effects)
  src/index.mjs       # stdio server: TOOLS catalogue + JSON-RPC dispatch
  src/smoke-test.mjs  # spawns server, runs initialize->tools/list->tools/call, asserts
```

Resolve the data file path from the module location with
`dirname(fileURLToPath(import.meta.url))` so it works regardless of the process CWD.

## How to add a new read-only tool

1. Decide `name` (snake_case), `description` (say "Read-only."), and `inputSchema`
   (JSON Schema; mark required args, set `additionalProperties: false`).
2. Implement the logic as a **pure function** in `src/data.mjs` that reads the cached
   dataset and returns a plain object. It must never write, delete, or mutate.
3. Add an entry to the `TOOLS` array in `src/index.mjs` (`name`, `description`,
   `inputSchema`, `handler`). The dispatch and `tools/list` derive from that array — no
   other wiring needed.
4. Return data via `content: [{ type: "text", text: JSON.stringify(result, null, 2) }]`.
   Validate arguments inside the handler and throw a clear `Error` on bad input.
5. Add an assertion to `src/smoke-test.mjs` and run it.

## Validate

```bash
node tools/mcp/<name>-mcp/src/smoke-test.mjs   # exit 0 = PASS
```

If the tool is new and agents should call it, confirm the MCP is registered in
`opencode.json` at the repo root (`type: "local"`, `command: ["node", ".../index.mjs"]`).

## Quality checklist

- [ ] Strictly **read-only**; no writes, deletes, or mutations of any file.
- [ ] Valid `inputSchema`; arguments validated; errors returned as `isError: true`.
- [ ] Logic lives as a pure function in `data.mjs`; no duplicated parsing.
- [ ] **Zero new dependencies**; logs go to `stderr`, never `stdout`.
- [ ] Smoke test is green; `stdout` contains only JSON-RPC lines.

## When to use this skill

- Building or extending any MCP in `tools/mcp/` (e.g. adding a memoir tool, or starting a
  new `slavigrad-cv` MCP over a future `cv-data.json`).

## When NOT to use it

- Touching the Angular app itself (use the Angular developer/architect agents).

## Safety limits

- Read the dataset only; never connect to a database or expose secrets / `.env`.
- Keep each MCP single-purpose and zero-dependency. One dataset per server.
