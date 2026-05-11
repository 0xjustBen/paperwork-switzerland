// Parity test: scripts/calc.js (node) vs scripts/calc.py (python3).
// Asserts identical numeric output (0.01 CHF tolerance) across 20 vectors.
// Skips python tests if `python3` is not on PATH.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CALC_JS = join(__dirname, 'calc.js');
const CALC_PY = join(__dirname, 'calc.py');

function hasPython3() {
  const r = spawnSync('python3', ['--version'], { encoding: 'utf-8' });
  return r.status === 0;
}

const PY_AVAILABLE = hasPython3();

function runJs(args) {
  const r = spawnSync(process.execPath, [CALC_JS, ...args], { encoding: 'utf-8' });
  if (r.status !== 0) throw new Error(`calc.js failed: ${r.stderr}`);
  return JSON.parse(r.stdout);
}

function runPy(args) {
  const r = spawnSync('python3', [CALC_PY, ...args], { encoding: 'utf-8' });
  if (r.status !== 0) throw new Error(`calc.py failed: ${r.stderr}`);
  return JSON.parse(r.stdout);
}

// 20 input vectors covering every subcommand.
const VECTORS = [
  ['vat', '--net', '1000', '--rate', 'normal'],
  ['vat', '--net', '12345.67', '--rate', 'reduced'],
  ['vat', '--net', '500', '--rate', 'lodging'],
  ['vat', '--net', '999.99', '--rate', 'exempt'],
  ['vat-extract', '--gross', '1081', '--rate', 'normal'],
  ['vat-extract', '--gross', '5000', '--rate', 'reduced'],
  ['vat-extract', '--gross', '2500.50', '--rate', 'lodging'],
  ['vat-threshold', '--turnover', '95000'],
  ['vat-threshold', '--turnover', '120000'],
  ['ifd', '--profit', '100000'],
  ['ifd', '--profit', '1234567.89'],
  ['ifd', '--profit', '0'],
  ['pm', '--canton', 'ZH', '--profit', '500000'],
  ['pm', '--canton', 'ZG', '--profit', '250000'],
  ['compare', '--cantons', 'ZH,ZG,GE', '--profit', '300000'],
  ['mutation', '--canton', 'ZH', '--price', '1500000'],
  ['ahv', '--salary', '85000'],
  ['ahv', '--salary', '120000.50'],
  ['bvg-deduction', '--salary', '60000'],
  ['prorata', '--amount', '12000', '--days', '90'],
];

function numericFields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'number') out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
  }
  return out;
}

function assertNumericMatch(a, b, label) {
  const an = numericFields(a);
  const bn = numericFields(b);
  const keys = new Set([...Object.keys(an), ...Object.keys(bn)]);
  for (const k of keys) {
    assert.ok(k in an, `${label}: js missing key ${k}`);
    assert.ok(k in bn, `${label}: py missing key ${k}`);
    if (typeof an[k] === 'boolean') {
      assert.equal(an[k], bn[k], `${label}: boolean ${k} mismatch`);
    } else {
      const diff = Math.abs(an[k] - bn[k]);
      assert.ok(diff <= 0.01, `${label}: ${k} diff ${diff} (js=${an[k]} py=${bn[k]})`);
    }
  }
}

for (const argv of VECTORS) {
  const label = argv.join(' ');
  test(`parity: ${label}`, { skip: !PY_AVAILABLE && 'python3 not available — SKIP' }, () => {
    const jsOut = runJs(argv);
    const pyOut = runPy(argv);
    if (argv[0] === 'compare') {
      assert.equal(Math.abs(jsOut.profit - pyOut.profit) <= 0.01, true);
      assert.equal(jsOut.rows.length, pyOut.rows.length, 'compare rows length');
      for (let i = 0; i < jsOut.rows.length; i++) {
        assert.equal(jsOut.rows[i].canton, pyOut.rows[i].canton, 'row order/canton');
        assertNumericMatch(jsOut.rows[i], pyOut.rows[i], `${label}[row ${i}]`);
      }
    } else {
      assertNumericMatch(jsOut, pyOut, label);
    }
  });
}

if (!PY_AVAILABLE) {
  console.log('SKIP: python3 not on PATH — parity tests skipped.');
}
