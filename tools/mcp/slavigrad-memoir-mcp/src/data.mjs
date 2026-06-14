// Read-only data layer for the Slavigrad memoir MCP.
//
// Loads the structured Egypt memoir JSON once and exposes pure query functions.
// Nothing here writes, mutates, or deletes — the dataset is treated as immutable.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// tools/mcp/slavigrad-memoir-mcp/src -> repo root is four levels up.
const DATA_PATH = resolve(
  HERE,
  '../../../../src/app/domains/memoir/data/egypt-memoir-structured.json'
);

let cache = null;

function load() {
  if (cache) return cache;
  cache = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  return cache;
}

function countWords(text) {
  return String(text || '').split(/\s+/).filter(Boolean).length;
}

// Normalize the introduction + chapters into a single uniform shape:
// { number, title, theme, subtitle, sections: [{ title, paragraphs }] }
function units() {
  const data = load();
  const intro = data.content?.introduction;
  const chapters = data.content?.chapters || [];

  const introUnit = intro
    ? {
        number: 0,
        title: 'Introduction',
        theme: null,
        subtitle: intro.subtitle || null,
        sections: [{ title: null, paragraphs: intro.paragraphs || [] }]
      }
    : null;

  const chapterUnits = chapters.map((c) => ({
    number: c.number,
    title: c.title,
    theme: c.theme ?? null,
    subtitle: null,
    sections: (c.sections || []).map((s) => ({
      title: s.title ?? null,
      paragraphs: s.paragraphs || []
    }))
  }));

  return introUnit ? [introUnit, ...chapterUnits] : chapterUnits;
}

function paragraphsOf(unit) {
  return unit.sections.reduce((n, s) => n + s.paragraphs.length, 0);
}

export function getMemoirMetadata() {
  const doc = load().document || {};
  return {
    title: doc.title ?? null,
    metaTitle: doc['meta-title'] ?? [],
    author: doc.author ?? null,
    metadata: doc.metadata ?? null
  };
}

export function listChapters() {
  const list = units().map((u) => ({
    number: u.number,
    title: u.title,
    theme: u.theme,
    sectionCount: u.sections.length,
    paragraphCount: paragraphsOf(u)
  }));
  return { chapterCount: list.filter((u) => u.number > 0).length, units: list };
}

export function getChapter({ number, title } = {}) {
  const all = units();
  let unit = null;

  if (number !== undefined && number !== null) {
    unit = all.find((u) => u.number === Number(number));
  } else if (title) {
    const q = String(title).toLowerCase();
    unit = all.find((u) => u.title.toLowerCase() === q)
      || all.find((u) => u.title.toLowerCase().includes(q));
  }

  if (!unit) {
    throw new Error(
      `Chapter not found (number=${number}, title=${title}). Use list_chapters to see valid numbers/titles.`
    );
  }
  return unit;
}

function snippet(paragraph, lowerQuery) {
  const lower = paragraph.toLowerCase();
  const at = lower.indexOf(lowerQuery);
  const start = Math.max(0, at - 60);
  const end = Math.min(paragraph.length, at + lowerQuery.length + 60);
  return `${start > 0 ? '…' : ''}${paragraph.slice(start, end)}${end < paragraph.length ? '…' : ''}`;
}

export function searchMemoir({ query, limit = 20 } = {}) {
  if (!query || !String(query).trim()) {
    throw new Error('search_memoir requires a non-empty "query" string.');
  }
  const q = String(query).toLowerCase();
  const cap = Math.max(1, Number(limit) || 20);
  const matches = [];

  for (const unit of units()) {
    unit.sections.forEach((section, sectionIndex) => {
      section.paragraphs.forEach((paragraph, paragraphIndex) => {
        if (paragraph.toLowerCase().includes(q)) {
          matches.push({
            chapterNumber: unit.number,
            chapterTitle: unit.title,
            sectionIndex,
            sectionTitle: section.title,
            paragraphIndex,
            snippet: snippet(paragraph, q)
          });
        }
      });
    });
  }
  return { query, totalMatches: matches.length, returned: Math.min(matches.length, cap), matches: matches.slice(0, cap) };
}

export function getMemoirStats() {
  const all = units();
  let sections = 0;
  let paragraphs = 0;
  let words = 0;

  for (const unit of all) {
    sections += unit.sections.length;
    for (const section of unit.sections) {
      paragraphs += section.paragraphs.length;
      for (const p of section.paragraphs) words += countWords(p);
    }
  }
  return {
    chapters: all.filter((u) => u.number > 0).length,
    includesIntroduction: all.some((u) => u.number === 0),
    sections,
    paragraphs,
    words,
    estimatedReadingTimeMinutes: Math.max(1, Math.ceil(words / 200))
  };
}
