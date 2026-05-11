#!/usr/bin/env node
/**
 * Verify every SKILL*.md has YAML front-matter with required fields:
 *   - name
 *   - description
 *   - metadata.last_updated (YYYY-MM-DD)
 *
 * Plain Node, no deps. Simple regex-based front-matter parser.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.venv', '.pytest_cache', '__pycache__']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/^SKILL.*\.md$/.test(e.name)) out.push(p);
  }
  return out;
}

function parseFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const body = m[1];
  // Very small YAML subset: top-level "key: value" and nested "key:\n  sub: value".
  const obj = {};
  const lines = body.split(/\r?\n/);
  let currentKey = null;
  let multiline = null; // { key, indent, lines }
  for (const line of lines) {
    if (multiline) {
      const indentMatch = line.match(/^(\s+)(.*)$/);
      if (indentMatch && indentMatch[1].length >= multiline.indent) {
        multiline.lines.push(indentMatch[2]);
        continue;
      } else {
        obj[multiline.key] = multiline.lines.join('\n');
        multiline = null;
      }
    }
    if (/^\s*$/.test(line) || /^\s*#/.test(line)) continue;
    const top = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (top) {
      const key = top[1];
      const val = top[2];
      if (val === '' || val === '>' || val === '|') {
        currentKey = key;
        obj[key] = {};
        if (val === '|' || val === '>') {
          multiline = { key, indent: 2, lines: [] };
          obj[key] = '';
        }
        continue;
      }
      // strip surrounding quotes
      let v = val.trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      obj[key] = v;
      currentKey = key;
      continue;
    }
    const nested = line.match(/^\s+([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (nested && currentKey && typeof obj[currentKey] === 'object') {
      let v = nested[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      obj[currentKey][nested[1]] = v;
    }
  }
  if (multiline) obj[multiline.key] = multiline.lines.join('\n');
  return obj;
}

function main() {
  const files = walk(ROOT);
  const failures = [];

  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    const fm = parseFrontMatter(text);
    if (!fm) {
      failures.push(`${path.relative(ROOT, f)}: missing YAML front-matter`);
      continue;
    }
    const missing = [];
    if (!fm.name || typeof fm.name !== 'string') missing.push('name');
    if (!fm.description || typeof fm.description !== 'string') missing.push('description');
    const lu = fm.metadata && typeof fm.metadata === 'object' ? fm.metadata.last_updated : undefined;
    if (!lu || !/^\d{4}-\d{2}-\d{2}$/.test(String(lu))) {
      missing.push('metadata.last_updated (YYYY-MM-DD)');
    }
    if (missing.length) {
      failures.push(`${path.relative(ROOT, f)}: missing/invalid ${missing.join(', ')}`);
    }
  }

  if (failures.length) {
    console.error('SKILL metadata check FAILED:');
    for (const m of failures) console.error('  -', m);
    process.exit(1);
  }
  console.log(`SKILL metadata check passed (${files.length} files).`);
}

main();
