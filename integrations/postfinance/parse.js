#!/usr/bin/env node
/**
 * Parse Swiss ISO 20022 camt.053 bank statements into JSON.
 *
 * Works for any Swiss bank that follows the Swiss Payment Standards: PostFinance,
 * UBS, CS/UBS, ZKB, BCV, Raiffeisen, etc. Offline — no API key required.
 *
 * Usage:
 *   node integrations/postfinance/parse.js statement.xml > transactions.json
 *   node integrations/postfinance/parse.js statement.xml --output txns.json
 */
'use strict';

const fs = require('fs');

function decodeXmlEntities(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function tagValue(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`);
  const m = xml.match(re);
  return m ? decodeXmlEntities(m[1].trim()) : null;
}

function allBlocks(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, 'g');
  return xml.match(re) || [];
}

function parseEntry(entry) {
  const amount = tagValue(entry, 'Amt');
  const currency = (() => {
    const m = entry.match(/<Amt[^>]*Ccy="([^"]+)"/);
    return m ? m[1] : 'CHF';
  })();
  const cdtDbtInd = tagValue(entry, 'CdtDbtInd');  // CRDT or DBIT
  const sign = cdtDbtInd === 'CRDT' ? 1 : -1;
  const bookingDate = tagValue(entry, 'BookgDt')?.match(/<Dt>([^<]+)</)?.[1] || null;
  const valueDate = tagValue(entry, 'ValDt')?.match(/<Dt>([^<]+)</)?.[1] || null;
  const remitInfo = (() => {
    const block = entry.match(/<RmtInf>[\s\S]*?<\/RmtInf>/);
    if (!block) return null;
    return tagValue(block[0], 'Ustrd');
  })();
  const counterParty = (() => {
    const block = entry.match(/<RltdPties>[\s\S]*?<\/RltdPties>/);
    if (!block) return null;
    return tagValue(block[0], 'Nm');
  })();
  return {
    booking_date: bookingDate,
    value_date: valueDate,
    amount: amount ? sign * Number(amount) : null,
    currency,
    direction: cdtDbtInd === 'CRDT' ? 'credit' : 'debit',
    counterparty: counterParty,
    description: remitInfo,
  };
}

function parseCamt053(xml) {
  const stmt = xml.match(/<Stmt>[\s\S]*?<\/Stmt>/);
  const account = stmt ? tagValue(stmt[0], 'IBAN') : null;
  const entries = allBlocks(xml, 'Ntry').map(parseEntry);
  return {
    account_iban: account,
    transactions: entries,
    count: entries.length,
  };
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t.startsWith('--')) {
      const k = t.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) { args[k] = true; }
      else { args[k] = next; i++; }
    } else { args._.push(t); }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = args._[0];
  if (!file) {
    console.error('usage: node parse.js <statement.xml> [--output out.json]');
    process.exit(2);
  }
  const xml = fs.readFileSync(file, 'utf-8');
  const result = parseCamt053(xml);
  const json = JSON.stringify(result, null, 2);
  if (args.output) {
    fs.writeFileSync(args.output, json, 'utf-8');
    console.error(`wrote ${args.output} (${result.count} transactions)`);
  } else {
    process.stdout.write(json + '\n');
  }
}

if (require.main === module) main();

module.exports = { parseCamt053 };
