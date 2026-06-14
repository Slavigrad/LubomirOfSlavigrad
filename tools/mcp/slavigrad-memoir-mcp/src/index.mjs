#!/usr/bin/env node
// Slavigrad memoir MCP server (zero-dependency, stdio JSON-RPC 2.0).
//
// Read-only access to the Egypt memoir (structured JSON) for OpenCode agents.
// Protocol: Model Context Protocol over stdio.
//   - Messages are newline-delimited JSON, no embedded newlines, UTF-8.
//   - stdout carries ONLY valid MCP messages. Logs go to stderr.
// See the skill slavigrad-mcp-authoring and this folder's README.md.

import {
  getChapter,
  getMemoirMetadata,
  getMemoirStats,
  listChapters,
  searchMemoir
} from './data.mjs';

const SERVER_INFO = { name: 'slavigrad-memoir', version: '1.0.0' };
const DEFAULT_PROTOCOL_VERSION = '2025-06-18';

// ---------------------------------------------------------------------------
// Tool catalogue (name + description + JSON Schema inputSchema + handler)
// ---------------------------------------------------------------------------
const TOOLS = [
  {
    name: 'list_chapters',
    description:
      'Lists the memoir units (introduction as number 0, then the 12 chapters) with title, theme, and section/paragraph counts. Read-only.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: () => listChapters()
  },
  {
    name: 'get_chapter',
    description:
      'Returns one full memoir unit by number (0 = introduction) or by title (exact, else substring). Includes sections and paragraphs. Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        number: { type: 'integer', minimum: 0, description: 'Chapter number; 0 is the introduction.' },
        title: { type: 'string', description: 'Chapter title (exact match preferred, substring fallback).' }
      },
      additionalProperties: false
    },
    handler: (args) => getChapter(args || {})
  },
  {
    name: 'search_memoir',
    description:
      'Case-insensitive substring search across every paragraph (introduction + chapters). Returns matches with chapter, section, paragraph index, and a snippet. Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Text to search for.' },
        limit: { type: 'integer', minimum: 1, description: 'Max matches to return (default 20).' }
      },
      required: ['query'],
      additionalProperties: false
    },
    handler: (args) => searchMemoir(args || {})
  },
  {
    name: 'get_memoir_metadata',
    description:
      'Returns the memoir document metadata: title, meta-title badges, author + links, language, genre, and years. Read-only.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: () => getMemoirMetadata()
  },
  {
    name: 'get_memoir_stats',
    description:
      'Returns deterministic counts (chapters, sections, paragraphs, words) and an estimated reading time. Read-only.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: () => getMemoirStats()
  }
];

const TOOLS_BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));
const PUBLIC_TOOLS = TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));

// ---------------------------------------------------------------------------
// JSON-RPC plumbing
// ---------------------------------------------------------------------------
function log(...args) {
  // stderr only — never pollute stdout (it is reserved for MCP messages).
  process.stderr.write(`[slavigrad-memoir] ${args.join(' ')}\n`);
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function sendResult(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function sendError(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

function handleToolCall(id, params) {
  const name = params && params.name;
  const tool = TOOLS_BY_NAME.get(name);
  if (!tool) {
    sendError(id, -32602, `Unknown tool: ${name}`);
    return;
  }
  try {
    const result = tool.handler(params.arguments || {});
    sendResult(id, { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
  } catch (error) {
    // Tool execution error reported in-band (isError), per MCP spec.
    sendResult(id, { content: [{ type: 'text', text: `Error in ${name}: ${error.message}` }], isError: true });
    log('tool error', name, error.message);
  }
}

function handleMessage(message) {
  const isRequest = Object.prototype.hasOwnProperty.call(message, 'id') && message.id !== null;
  const { id, method, params } = message;

  switch (method) {
    case 'initialize':
      sendResult(id, {
        protocolVersion: typeof params?.protocolVersion === 'string' ? params.protocolVersion : DEFAULT_PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
        instructions: 'Read-only access to the Slavigrad Egypt memoir. Figures are descriptive; the dataset is never modified.'
      });
      return;
    case 'notifications/initialized':
    case 'initialized':
      return; // notification — no response
    case 'ping':
      if (isRequest) sendResult(id, {});
      return;
    case 'tools/list':
      if (isRequest) sendResult(id, { tools: PUBLIC_TOOLS });
      return;
    case 'tools/call':
      if (isRequest) handleToolCall(id, params || {});
      return;
    default:
      if (isRequest) sendError(id, -32601, `Method not found: ${method}`);
      else log('ignoring notification', method);
  }
}

// ---------------------------------------------------------------------------
// stdin reader: newline-delimited JSON messages
// ---------------------------------------------------------------------------
let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    if (!line) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      sendError(null, -32700, 'Parse error');
      continue;
    }
    const items = Array.isArray(message) ? message : [message];
    for (const item of items) {
      try {
        handleMessage(item);
      } catch (error) {
        log('handler crash', error.message);
        if (item && item.id !== undefined && item.id !== null) sendError(item.id, -32603, `Internal error: ${error.message}`);
      }
    }
  }
});
process.stdin.on('end', () => process.exit(0));

log(`ready — ${TOOLS.length} read-only tools (${PUBLIC_TOOLS.map((t) => t.name).join(', ')})`);
