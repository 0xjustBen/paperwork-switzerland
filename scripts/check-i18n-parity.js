#!/usr/bin/env node
/**
 * i18n parity check for paperwork-switzerland.
 *
 * For each base file (README.md, CONTRIBUTING.md, and every <skill>/SKILL.md),
 * verifies that .fr.md / .de.md / .it.md siblings exist and that line counts,
 * heading counts (lines starting with `#`) and code-block counts are within
 * 30% of the base. Exits 1 if any sibling is missing or any count delta > 30%.
 *
 * Plain Node, no deps.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const LOCALES = ['fr', 'de', 'it'];
const THRESHOLD = 0.30;

function findBases() {
  const bases = [];
  for (const top of ['README.md', 'CONTRIBUTING.md']) {
    const p = path.join(ROOT, top);
    if (fs.existsSync(p)) bases.push(p);
  }
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    const skill = path.join(ROOT, entry.name, 'SKILL.md');
    if (fs.existsSync(skill)) bases.push(skill);
  }
  return bases;
}

function siblingFor(basePath, locale) {
  // foo/SKILL.md -> foo/SKILL.<locale>.md ; README.md -> README.<locale>.md
  const dir = path.dirname(basePath);
  const file = path.basename(basePath);
  const dot = file.lastIndexOf('.');
  const stem = file.slice(0, dot);
  const ext = file.slice(dot);
  return path.join(dir, `${stem}.${locale}${ext}`);
}

function metrics(text) {
  const lines = text.split(/\r?\n/);
  const headingCount = lines.filter((l) => /^#+\s/.test(l)).length;
  const fenceCount = lines.filter((l) => /^```/.test(l)).length;
  const codeBlockCount = Math.floor(fenceCount / 2);
  return { lines: lines.length, headings: headingCount, codeBlocks: codeBlockCount };
}

function delta(a, b) {
  if (a === 0 && b === 0) return 0;
  if (a === 0 || b === 0) return 1;
  return Math.abs(a - b) / Math.max(a, b);
}

function fmtPct(d) {
  return `${(d * 100).toFixed(0)}%`;
}

function rel(p) {
  return path.relative(ROOT, p);
}

function main() {
  const bases = findBases();
  let failed = false;
  const rows = [];

  for (const base of bases) {
    const baseText = fs.readFileSync(base, 'utf8');
    const baseM = metrics(baseText);
    for (const loc of LOCALES) {
      const sib = siblingFor(base, loc);
      if (!fs.existsSync(sib)) {
        rows.push({
          base: rel(base),
          loc,
          status: 'MISSING',
          lines: '-',
          headings: '-',
          code: '-',
        });
        failed = true;
        continue;
      }
      const m = metrics(fs.readFileSync(sib, 'utf8'));
      const dLines = delta(baseM.lines, m.lines);
      const dHeads = delta(baseM.headings, m.headings);
      const dCode = delta(baseM.codeBlocks, m.codeBlocks);
      const bad = dLines > THRESHOLD || dHeads > THRESHOLD || dCode > THRESHOLD;
      if (bad) failed = true;
      rows.push({
        base: rel(base),
        loc,
        status: bad ? 'FAIL' : 'OK',
        lines: `${m.lines}/${baseM.lines} (${fmtPct(dLines)})`,
        headings: `${m.headings}/${baseM.headings} (${fmtPct(dHeads)})`,
        code: `${m.codeBlocks}/${baseM.codeBlocks} (${fmtPct(dCode)})`,
      });
    }
  }

  // Print table
  const cols = ['base', 'loc', 'status', 'lines', 'headings', 'code'];
  const widths = Object.fromEntries(
    cols.map((c) => [c, Math.max(c.length, ...rows.map((r) => String(r[c]).length))]),
  );
  const fmt = (r) => cols.map((c) => String(r[c]).padEnd(widths[c])).join('  ');
  console.log(fmt(Object.fromEntries(cols.map((c) => [c, c.toUpperCase()]))));
  console.log(cols.map((c) => '-'.repeat(widths[c])).join('  '));
  for (const r of rows) console.log(fmt(r));

  if (failed) {
    console.error('\ni18n parity check FAILED.');
    process.exit(1);
  } else {
    console.log('\ni18n parity check passed.');
  }
}

main();
