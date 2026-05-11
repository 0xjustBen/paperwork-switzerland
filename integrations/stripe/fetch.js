#!/usr/bin/env node
/**
 * Stripe connector.
 * Pulls charges, payouts, fees for any Stripe account configured in company.json.
 *
 * Required env vars (per account, configurable):
 *   STRIPE_SECRET            for single accounts
 *   STRIPE_PLATFORM_SECRET   for Stripe Connect platforms
 *
 * See integrations/.env.template for the full list of integration env vars.
 *
 * Usage:
 *   node integrations/stripe/fetch.js                                    # all accounts
 *   node integrations/stripe/fetch.js --account main
 *   node integrations/stripe/fetch.js --start 2026-01-01 --end 2026-03-31
 */
'use strict';

const fs = require('fs');
const path = require('path');

function loadCompany() {
  const p = path.join(__dirname, '..', '..', 'company.json');
  const examplePath = path.join(__dirname, '..', '..', 'company.example.json');
  const target = fs.existsSync(p) ? p : examplePath;
  return JSON.parse(fs.readFileSync(target, 'utf-8'));
}

function dateToUnix(s) {
  if (!s) return undefined;
  return Math.floor(new Date(s).getTime() / 1000);
}

async function fetchAccount(account, start, end) {
  let Stripe;
  try { Stripe = require('stripe'); }
  catch (e) {
    throw new Error('stripe not installed. Run: npm install');
  }
  const key = process.env[account.env_key];
  if (!key) {
    throw new Error(`${account.env_key} env var missing for account '${account.id}'`);
  }
  const stripe = new Stripe(key);
  const opts = account.stripe_account_id ? { stripeAccount: account.stripe_account_id } : {};

  const charges = [];
  const payouts = [];
  const created = {};
  if (start) created.gte = dateToUnix(start);
  if (end) created.lte = dateToUnix(end);

  for await (const c of stripe.charges.list({ created, limit: 100 }, opts)) charges.push(c);
  for await (const p of stripe.payouts.list({ created, limit: 100 }, opts)) payouts.push(p);

  return { account: account.id, name: account.name, charges, payouts };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t.startsWith('--')) {
      const k = t.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) { args[k] = true; }
      else { args[k] = next; i++; }
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const company = loadCompany();
  const accounts = (company.stripe_accounts || []).filter(a => !args.account || a.id === args.account);
  if (accounts.length === 0) {
    throw new Error('no matching Stripe account in company.json');
  }
  const out = {};
  for (const acc of accounts) {
    out[acc.id] = await fetchAccount(acc, args.start, args.end);
    console.log(`  ${acc.id}: ${out[acc.id].charges.length} charges, ${out[acc.id].payouts.length} payouts`);
  }
  const file = args.output || `stripe-${Date.now()}.json`;
  fs.writeFileSync(file, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`wrote ${file}`);
}

if (require.main === module) {
  main().catch(err => { console.error(err.message); process.exit(1); });
}

module.exports = { fetchAccount };
