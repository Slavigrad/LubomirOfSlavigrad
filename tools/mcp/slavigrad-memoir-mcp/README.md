# slavigrad-memoir MCP

Local **read-only** MCP server that exposes the Slavigrad Egypt memoir to OpenCode
agents. Lets an agent list chapters, read a chapter, search the text, and get metadata
and stats **without re-reading the source file** every time.

- **Data source**: `src/app/domains/memoir/data/egypt-memoir-structured.json`.
- **Mode**: strictly read-only. No tool writes, deletes, or mutates anything.
- **Dependencies**: **none**. A stdio MCP server (JSON-RPC 2.0) implemented by hand with
  Node ≥ 22. It "starts with `node`, and that's it."
- **No LLM, no network.** Outputs are deterministic.

## Tools

| Tool | Args | Returns |
|------|------|---------|
| `list_chapters` | — | Introduction (number 0) + 12 chapters with title, theme, section/paragraph counts. |
| `get_chapter` | `number?` (0 = intro) or `title?` | One full unit: sections → paragraphs. |
| `search_memoir` | `query`, `limit?` (default 20) | Case-insensitive matches with chapter/section/paragraph index + snippet. |
| `get_memoir_metadata` | — | Title, meta-title badges, author + links, language, genre, years. |
| `get_memoir_stats` | — | Counts (chapters, sections, paragraphs, words) + estimated reading time. |

## How OpenCode uses it

Registered in `opencode.json` (repo root):

```json
{
  "mcp": {
    "slavigrad-memoir": {
      "type": "local",
      "command": ["node", "tools/mcp/slavigrad-memoir-mcp/src/index.mjs"],
      "enabled": true
    }
  }
}
```

OpenCode starts the process automatically and exposes the tools prefixed with the server
name (e.g. `slavigrad-memoir_search_memoir`). Build or extend tools via the
`/slavigrad-build-mcp-tool` command and the `slavigrad-mcp-builder` agent.

## Testing it (smoke test)

```bash
node tools/mcp/slavigrad-memoir-mcp/src/smoke-test.mjs
# or
npm --prefix tools/mcp/slavigrad-memoir-mcp run check
```

The smoke test performs `initialize` → `tools/list` → `tools/call` and asserts the
responses (5 tools, 12 chapters, positive word count, ≥1 match for "Cairo"). Exit code
0 = OK.

## Manual call (debugging)

The server speaks JSON-RPC over stdin/stdout (one JSON message per line):

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"cli","version":"1.0.0"}}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_memoir_stats","arguments":{}}}' \
  | node tools/mcp/slavigrad-memoir-mcp/src/index.mjs
```

(Logs go to `stderr`; `stdout` only carries MCP messages.)

## Layout

```text
tools/mcp/slavigrad-memoir-mcp/
  package.json        # metadata + scripts; no runtime dependencies
  README.md           # this file
  src/data.mjs        # read-only loader + pure query functions
  src/index.mjs       # stdio server (handshake + tool dispatch)
  src/smoke-test.mjs  # initialize -> tools/list -> tools/call assertions
```

## Why zero-dependency

Reproducibility and immediate startup: the server runs with `node` and nothing else — no
`npm install`, no network. MCP over stdio is simple JSON-RPC and can be implemented by
hand. See the `slavigrad-mcp-authoring` skill for the protocol details and the checklist
for adding a new tool.

## Extending later (e.g. a CV MCP)

This server is memoir-only by design. A future `slavigrad-cv` MCP can follow the exact
same pattern over a `cv-data.json` (to be produced from the CV `.ts` data files). Keep
each MCP zero-dependency and strictly read-only.
```
