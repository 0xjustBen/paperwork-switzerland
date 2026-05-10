#!/usr/bin/env node
/**
 * Deterministic calc.js tests. Pure Node, no external deps.
 *
 *   node scripts/test-deterministic-calculations.js
 */
'use strict';
const { cmds, VAT_RATES, IFD_EFFECTIVE, VAT_THRESHOLD, resolveRate, round2 } = require('./calc');

let passed = 0;
let failed = 0;

function ok(label, condition, extra) {
  if (condition) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.log(`  ✗ ${label}${extra ? ' — ' + extra : ''}`); }
}

function near(a, b, eps = 0.01) { return Math.abs(a - b) <= eps; }

console.log('VAT');
{
  const r = cmds.vat({ net: 1000, rate: 'normal' });
  ok('vat normal 1000 → 81', r.vat === 81 && r.gross === 1081);
  ok('vat reduced 1000 → 26', cmds.vat({ net: 1000, rate: 'reduced' }).vat === 26);
  ok('vat lodging 1000 → 38', cmds.vat({ net: 1000, rate: 'lodging' }).vat === 38);
  ok('vat exempt → 0', cmds.vat({ net: 1000, rate: 'exempt' }).vat === 0);
}

console.log('VAT extract');
{
  const r = cmds['vat-extract']({ gross: 1081, rate: 'normal' });
  ok('extract 1081 → 1000 + 81', near(r.net, 1000) && near(r.vat, 81));
}

console.log('VAT threshold (art. 10 LTVA)');
{
  ok('95k not subject', cmds['vat-threshold']({ turnover: 95000 }).subject_to_vat === false);
  ok('100k subject',     cmds['vat-threshold']({ turnover: 100000 }).subject_to_vat === true);
  ok('150k subject',     cmds['vat-threshold']({ turnover: 150000 }).subject_to_vat === true);
}

console.log('IFD (federal direct tax)');
{
  ok('effective ~7.834 %', near(IFD_EFFECTIVE, 7.834, 0.01));
  ok('zero profit → 0',   cmds.ifd({ profit: 0 }).ifd_tax === 0);
  const r = cmds.ifd({ profit: 100000 });
  ok('100k → ~7 834', near(r.ifd_tax, 7834, 1));
}

console.log('PM (combined corporate tax)');
{
  const zg = cmds.pm({ canton: 'ZG', profit: 500000 });
  ok('ZG canton loaded', zg.canton === 'ZG');
  ok('ZG rate < 13 %',   zg.effective_rate_pct < 13);
  ok('ZG tax > 0',       zg.tax > 0);
  const ge = cmds.pm({ canton: 'GE', profit: 500000 });
  ok('GE tax > ZG tax',  ge.tax > zg.tax);
}

console.log('Compare cantons');
{
  const r = cmds.compare({ cantons: 'ZH,ZG,GE', profit: 500000 });
  ok('returns 3 rows',    r.rows.length === 3);
  const rates = r.rows.map(x => x.effective_rate_pct);
  ok('sorted ascending',  rates[0] <= rates[1] && rates[1] <= rates[2]);
}

console.log('Mutation duty');
{
  const ge = cmds.mutation({ canton: 'GE', price: 1000000 });
  ok('GE 3 % on 1 mio CHF = 30k', ge.duty === 30000);
  const zh = cmds.mutation({ canton: 'ZH', price: 1000000 });
  ok('ZH 0 % mutation',           zh.duty === 0);
}

console.log('AHV / BVG');
{
  const ahv = cmds.ahv({ salary: 100000 });
  ok('AHV/IV/EO on 100k = 10 600', ahv.ahv_iv_eo_amount === 10600);
  const bvg = cmds['bvg-deduction']({ salary: 80000 });
  ok('BVG insured salary = salary - 25 725', bvg.insured_salary === 80000 - 25725);
}

console.log('Prorata');
{
  const r = cmds.prorata({ amount: 12000, days: 90 });
  ok('prorata 12000 × 90/365', near(r.prorata, 12000 * 90 / 365));
}

console.log('Aliases');
{
  ok('alias normale → 8.1',     resolveRate('normale') === 8.1);
  ok('alias Beherbergung → 3.8', resolveRate('beherbergung') === 3.8);
  ok('alias alloggio → 3.8',     resolveRate('alloggio') === 3.8);
  ok('numeric 5 → 5',            resolveRate('5') === 5);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
