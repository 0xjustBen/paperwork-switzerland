#!/usr/bin/env node
/**
 * bexio connector — Swiss SME accounting platform.
 * Fetches contacts, invoices, banking transactions.
 *
 * Required env vars:
 *   BEXIO_API_TOKEN  (Account → API tokens)
 *
 * Usage:
 *   node integrations/bexio/fetch.js                       # all data, current year
 *   node integrations/bexio/fetch.js --resource invoices
 *   node integrations/bexio/fetch.js --start 2026-01-01 --end 2026-12-31
 */
'use strict';

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.bexio.com/2.0';

function getHeaders() {
  const token = process.env.BEXIO_API_TOKEN;
  if (!token) {
    throw new Error(
      'BEXIO_API_TOKEN missing.\n' +
      'Set it in your shell or .env file.\n' +
      'Available at bexio dashboard → Account → API tokens.'
    );
  }
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function pagedGet(endpoint, params = {}) {
  const headers = getHeaders();
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = new URL(`${API_BASE}/${endpoint}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error(`bexio API ${r.status}: ${r.statusText} on ${endpoint}`);
    const batch = await r.json();
    all.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return all;
}

async function fetchContacts() { return pagedGet('contact'); }
async function fetchInvoices(start, end) {
  const params = {};
  if (start) params.date_from = start;
  if (end) params.date_to = end;
  return pagedGet('kb_invoice', params);
}
async function fetchBankAccounts() { return pagedGet('banking/accounts'); }

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
  const resource = args.resource || 'all';
  const start = args.start;
  const end = args.end;
  const out = args.output || `bexio-${resource}-${Date.now()}.json`;

  const data = {};
  if (resource === 'all' || resource === 'contacts') data.contacts = await fetchContacts();
  if (resource === 'all' || resource === 'invoices') data.invoices = await fetchInvoices(start, end);
  if (resource === 'all' || resource === 'accounts') data.bank_accounts = await fetchBankAccounts();

  fs.writeFileSync(out, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`wrote ${out}`);
  for (const [k, v] of Object.entries(data)) {
    console.log(`  ${k}: ${Array.isArray(v) ? v.length : '?'} items`);
  }
}

if (require.main === module) {
  main().catch(err => { console.error(err.message); process.exit(1); });
}

module.exports = { fetchContacts, fetchInvoices, fetchBankAccounts };
