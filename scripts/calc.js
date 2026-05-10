#!/usr/bin/env node
/**
 * Deterministic Swiss tax / accounting calculator.
 *
 * LLMs are bad at arithmetic. Skills should shell out to this script for any
 * numeric calculation instead of computing inline.
 *
 * Modeled on romainsimon/paperasse `scripts/calc.js` — same shape, Swiss formulas.
 *
 * Usage:
 *   node scripts/calc.js <command> [--param value]
 *
 * Commands:
 *   vat            --net <chf> --rate <normal|reduced|lodging|exempt>
 *   vat-extract    --gross <chf> --rate <normal|reduced|lodging>
 *   vat-threshold  --turnover <chf>
 *   ifd            --profit <chf>
 *   pm             --canton <XX> --profit <chf>
 *   compare        --cantons ZH,ZG,GE --profit <chf>
 *   mutation       --canton <XX> --price <chf>
 *   ahv            --salary <chf>             (employer + employee combined ~10.6 %)
 *   bvg-deduction  --salary <chf>             (coordination deduction ~25 725 CHF)
 *   prorata        --amount <chf> --days <n> [--base 365]
 *
 *   Output is JSON unless --pretty is given.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const VAT_RATES = { normal: 8.1, reduced: 2.6, lodging: 3.8, exempt: 0.0 };
const VAT_ALIASES = {
  standard: 'normal', normale: 'normal', n: 'normal',
  reduit: 'reduced', réduit: 'reduced', ridotta: 'reduced', ridotto: 'reduced', r: 'reduced',
  hebergement: 'lodging', hébergement: 'lodging', alloggio: 'lodging', beherbergung: 'lodging',
};
const IFD_EFFECTIVE = 8.5 / 1.085;  // ~7.834 %, effective rate on pre-tax profit
const VAT_THRESHOLD = 100000;       // art. 10 LTVA / MWSTG
const AHV_COMBINED_PCT = 10.6;      // AHV/IV/EO 2024-2026, employer+employee combined
const UI_COMBINED_PCT = 2.2;        // ALV up to ceiling
const BVG_COORDINATION_2026 = 25725; // CHF — coordination deduction (7/8 of max OASI pension)

const CANTONS_DIR = path.join(__dirname, '..', 'data', 'cantons');

function fail(msg) { console.error(`error: ${msg}`); process.exit(2); }

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const eq = token.indexOf('=');
      if (eq > 2) { args[token.slice(2, eq)] = token.slice(eq + 1); continue; }
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) { args[key] = true; }
      else { args[key] = next; i++; }
    } else { args._.push(token); }
  }
  return args;
}

function parseNumber(value, name) {
  if (value === undefined || value === true) fail(`missing --${name}`);
  const n = Number(String(value).replace(/[\s']/g, '').replace(',', '.'));
  if (!Number.isFinite(n)) fail(`invalid number for --${name}: ${value}`);
  return n;
}

function resolveRate(input) {
  if (input === undefined || input === true) return VAT_RATES.normal;
  const numeric = Number(input);
  if (Number.isFinite(numeric)) return numeric;
  const key = String(input).toLowerCase().trim();
  const resolved = VAT_ALIASES[key] || key;
  if (!(resolved in VAT_RATES)) fail(`unknown VAT rate '${input}'`);
  return VAT_RATES[resolved];
}

function loadCanton(code) {
  if (!code) fail('missing --canton');
  const upper = String(code).toUpperCase();
  const p = path.join(CANTONS_DIR, `${upper}.json`);
  if (!fs.existsSync(p)) fail(`unknown canton '${code}'`);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function round2(n) { return Math.round(n * 100) / 100; }

// --- Commands ----------------------------------------------------------

const cmds = {
  vat(args) {
    const net = parseNumber(args.net, 'net');
    const rate = resolveRate(args.rate);
    const vat = round2(net * rate / 100);
    return { net: round2(net), vat, gross: round2(net + vat), rate_pct: rate };
  },
  'vat-extract'(args) {
    const gross = parseNumber(args.gross, 'gross');
    const rate = resolveRate(args.rate);
    const net = round2(gross / (1 + rate / 100));
    return { net, vat: round2(gross - net), gross: round2(gross), rate_pct: rate };
  },
  'vat-threshold'(args) {
    const t = parseNumber(args.turnover, 'turnover');
    return {
      turnover: round2(t),
      threshold: VAT_THRESHOLD,
      subject_to_vat: t >= VAT_THRESHOLD,
      headroom: round2(VAT_THRESHOLD - t),
      legal_basis: 'art. 10 LTVA / MWSTG',
    };
  },
  ifd(args) {
    const profit = parseNumber(args.profit, 'profit');
    if (profit <= 0) return { profit: 0, ifd_tax: 0, effective_rate_pct: 0 };
    return {
      profit: round2(profit),
      effective_rate_pct: round2(IFD_EFFECTIVE),
      ifd_tax: round2(profit * IFD_EFFECTIVE / 100),
      legal_basis: 'art. 68 LIFD / DBG',
    };
  },
  pm(args) {
    const profit = parseNumber(args.profit, 'profit');
    const c = loadCanton(args.canton);
    const rate = c.fiscalite?.taux_pm_effectif_indicatif;
    if (rate === undefined) fail(`no PM rate available for canton ${c.code}`);
    const tax = round2(profit * rate / 100);
    return {
      canton: c.code,
      canton_name: c.nom.fr || c.nom.de || c.nom.it,
      profit: round2(profit),
      effective_rate_pct: rate,
      tax,
      net_profit: round2(profit - tax),
      note: 'indicative — chef-lieu commune, federal+canton+communal combined',
    };
  },
  compare(args) {
    if (!args.cantons) fail('missing --cantons');
    const profit = parseNumber(args.profit, 'profit');
    const codes = String(args.cantons).split(',').map(s => s.trim().toUpperCase());
    const rows = codes.map(code => {
      const c = loadCanton(code);
      const rate = c.fiscalite?.taux_pm_effectif_indicatif;
      const tax = rate !== undefined ? round2(profit * rate / 100) : null;
      return {
        canton: c.code,
        name: c.nom.fr || c.nom.de || c.nom.it,
        effective_rate_pct: rate ?? null,
        tax,
      };
    });
    rows.sort((a, b) => (a.effective_rate_pct ?? 999) - (b.effective_rate_pct ?? 999));
    return { profit: round2(profit), rows };
  },
  mutation(args) {
    const price = parseNumber(args.price, 'price');
    const c = loadCanton(args.canton);
    const rate = c.fiscalite?.droits_mutation_immo_pct;
    if (rate === undefined) fail(`no mutation rate for canton ${c.code}`);
    return {
      canton: c.code,
      price: round2(price),
      rate_pct: rate,
      duty: round2(price * rate / 100),
      note: 'cantonal real-estate transfer duty (indicative, varies by commune in some cantons)',
    };
  },
  ahv(args) {
    const salary = parseNumber(args.salary, 'salary');
    return {
      salary: round2(salary),
      ahv_iv_eo_combined_pct: AHV_COMBINED_PCT,
      ui_combined_pct: UI_COMBINED_PCT,
      ahv_iv_eo_amount: round2(salary * AHV_COMBINED_PCT / 100),
      ui_amount: round2(salary * UI_COMBINED_PCT / 100),
      employer_share_approx: round2(salary * (AHV_COMBINED_PCT + UI_COMBINED_PCT) / 200),
      employee_share_approx: round2(salary * (AHV_COMBINED_PCT + UI_COMBINED_PCT) / 200),
      legal_basis: 'LAVS / AHVG, LACI / AVIG',
    };
  },
  'bvg-deduction'(args) {
    const salary = parseNumber(args.salary, 'salary');
    const insured = Math.max(0, salary - BVG_COORDINATION_2026);
    return {
      salary: round2(salary),
      coordination_deduction: BVG_COORDINATION_2026,
      insured_salary: round2(insured),
      legal_basis: 'art. 8 LPP / BVG',
    };
  },
  prorata(args) {
    const amount = parseNumber(args.amount, 'amount');
    const days = parseNumber(args.days, 'days');
    const base = args.base !== undefined ? parseNumber(args.base, 'base') : 365;
    return { amount: round2(amount), days, base, prorata: round2(amount * days / base) };
  },
};

function help() {
  console.log(`Swiss deterministic calculator. Subcommands:
  vat --net <chf> --rate <normal|reduced|lodging|exempt>
  vat-extract --gross <chf> --rate <normal|reduced|lodging>
  vat-threshold --turnover <chf>
  ifd --profit <chf>
  pm --canton <XX> --profit <chf>
  compare --cantons ZH,ZG,GE --profit <chf>
  mutation --canton <XX> --price <chf>
  ahv --salary <chf>
  bvg-deduction --salary <chf>
  prorata --amount <chf> --days <n> [--base 365]

Add --pretty for human output instead of JSON.`);
}

function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  const cmd = args._[0];
  if (!cmd || cmd === '--help' || cmd === '-h') { help(); process.exit(0); }
  if (!(cmd in cmds)) fail(`unknown command '${cmd}'. Run --help.`);
  const result = cmds[cmd](args);
  if (args.pretty) {
    for (const [k, v] of Object.entries(result)) {
      if (Array.isArray(v)) {
        console.log(`${k}:`);
        for (const row of v) console.log(`  ${JSON.stringify(row)}`);
      } else {
        console.log(`  ${k.padEnd(22)} ${typeof v === 'number' ? v.toLocaleString('de-CH') : v}`);
      }
    }
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

if (require.main === module) main();

module.exports = { cmds, VAT_RATES, IFD_EFFECTIVE, VAT_THRESHOLD, round2, resolveRate };
