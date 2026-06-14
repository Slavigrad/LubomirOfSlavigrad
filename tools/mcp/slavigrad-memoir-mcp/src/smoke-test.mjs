#!/usr/bin/env node
// Cross-platform smoke test for the Slavigrad memoir MCP server.
//
// Spawns the server, runs a full MCP handshake (initialize -> initialized ->
// tools/list -> tools/call) over stdio, and asserts the responses.
// Exit code 0 = PASS, 1 = FAIL.

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(HERE, 'index.mjs');

const REQUESTS = [
  { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'smoke-test', version: '1.0.0' } } },
  { jsonrpc: '2.0', method: 'notifications/initialized' },
  { jsonrpc: '2.0', id: 2, method: 'tools/list' },
  { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'list_chapters', arguments: {} } },
  { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'get_memoir_stats', arguments: {} } },
  { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'search_memoir', arguments: { query: 'Cairo' } } }
];

const REQUIRED_TOOLS = ['list_chapters', 'get_chapter', 'search_memoir', 'get_memoir_metadata', 'get_memoir_stats'];
const EXPECTED_RESPONSES = REQUESTS.filter((r) => r.id !== undefined).length;

const checks = [];
const check = (label, ok, detail = '') => checks.push({ label, ok: !!ok, detail });
const parseToolJson = (response) => JSON.parse(response.result.content[0].text);

function run() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SERVER], { stdio: ['pipe', 'pipe', 'inherit'] });
    const responses = new Map();
    let buffer = '';

    const timer = setTimeout(() => {
      child.kill();
      resolve(responses);
    }, 10000);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      let index;
      while ((index = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, index).trim();
        buffer = buffer.slice(index + 1);
        if (!line) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id !== undefined && msg.id !== null) responses.set(msg.id, msg);
        } catch {
          /* ignore non-JSON */
        }
        if (responses.size >= EXPECTED_RESPONSES) {
          clearTimeout(timer);
          child.stdin.end();
          child.kill();
          resolve(responses);
        }
      }
    });

    child.on('error', () => {
      clearTimeout(timer);
      resolve(responses);
    });

    for (const request of REQUESTS) child.stdin.write(`${JSON.stringify(request)}\n`);
  });
}

const responses = await run();

// initialize
const init = responses.get(1);
check('initialize returns serverInfo', init?.result?.serverInfo?.name === 'slavigrad-memoir',
  init ? JSON.stringify(init.result?.serverInfo) : 'no response');

// tools/list
const toolNames = (responses.get(2)?.result?.tools || []).map((t) => t.name);
check('tools/list returns all required tools', REQUIRED_TOOLS.every((n) => toolNames.includes(n)),
  `tools: ${toolNames.join(', ')}`);

// list_chapters
let chapters = null;
try { chapters = parseToolJson(responses.get(3)); } catch { /* noop */ }
check('list_chapters reports 12 chapters', chapters?.chapterCount === 12,
  chapters ? `chapterCount=${chapters.chapterCount}` : 'no response');

// get_memoir_stats
let stats = null;
try { stats = parseToolJson(responses.get(4)); } catch { /* noop */ }
check('get_memoir_stats reports a positive word count', (stats?.words || 0) > 0,
  stats ? `words=${stats.words}, readMin=${stats.estimatedReadingTimeMinutes}` : 'no response');

// search_memoir
let search = null;
try { search = parseToolJson(responses.get(5)); } catch { /* noop */ }
check('search_memoir("Cairo") finds at least one match', (search?.totalMatches || 0) >= 1,
  search ? `totalMatches=${search.totalMatches}` : 'no response');

// Report
let failed = 0;
for (const c of checks) {
  if (!c.ok) failed += 1;
  process.stdout.write(`[${c.ok ? 'PASS' : 'FAIL'}] ${c.label}${c.detail ? ` — ${c.detail}` : ''}\n`);
}

if (failed === 0) {
  process.stdout.write(`\n✅ slavigrad-memoir MCP OK (${checks.length} checks).\n`);
  process.exit(0);
}
process.stdout.write(`\n❌ ${failed}/${checks.length} checks failed.\n`);
process.exit(1);
