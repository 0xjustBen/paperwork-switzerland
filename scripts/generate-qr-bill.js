#!/usr/bin/env node
/**
 * Generate a Swiss QR-bill (factur QR / QR-Rechnung) — replaces the old red
 * and orange payment slips since 2022-09-30.
 *
 * Spec: Swiss Payment Standard, "QR-bill style guide". Implementation uses
 * the `swissqrbill` npm package; this script is a thin CLI on top.
 *
 * Usage:
 *   node scripts/generate-qr-bill.js \
 *     --creditor-iban CH4431999123000889012 \
 *     --creditor-name "Example SA" \
 *     --creditor-zip 8001 --creditor-city Zürich \
 *     --debtor-name "Acme Sàrl" --debtor-zip 1003 --debtor-city Lausanne \
 *     --amount 1081 --currency CHF --reference 210000000003139471430009017 \
 *     --out qr-bill.pdf
 */
'use strict';
const fs = require('fs');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t.startsWith('--')) {
      const key = t.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) { args[key] = true; }
      else { args[key] = next; i++; }
    }
  }
  return args;
}

function fail(msg) { console.error(`error: ${msg}`); process.exit(2); }

function main() {
  const args = parseArgs(process.argv.slice(2));
  const required = ['creditor-iban', 'creditor-name', 'creditor-zip', 'creditor-city',
                    'debtor-name', 'debtor-zip', 'debtor-city', 'amount'];
  for (const k of required) if (!args[k] || args[k] === true) fail(`missing --${k}`);

  let SwissQRBill;
  try { SwissQRBill = require('swissqrbill'); }
  catch (e) {
    console.error('swissqrbill not installed. Run: npm install');
    console.error('Falling back to printing the QR-bill data as JSON.\n');
    console.log(JSON.stringify({
      creditor: { iban: args['creditor-iban'], name: args['creditor-name'],
                  zip: args['creditor-zip'], city: args['creditor-city'], country: 'CH' },
      debtor:   { name: args['debtor-name'],
                  zip: args['debtor-zip'], city: args['debtor-city'], country: 'CH' },
      amount: Number(args.amount),
      currency: args.currency || 'CHF',
      reference: args.reference,
      message: args.message,
    }, null, 2));
    process.exit(0);
  }

  const data = {
    currency: args.currency || 'CHF',
    amount: Number(args.amount),
    reference: args.reference,
    additionalInformation: args.message,
    creditor: { name: args['creditor-name'], address: args['creditor-street'] || '',
                zip: args['creditor-zip'], city: args['creditor-city'], country: 'CH',
                account: args['creditor-iban'] },
    debtor:   { name: args['debtor-name'], address: args['debtor-street'] || '',
                zip: args['debtor-zip'], city: args['debtor-city'], country: 'CH' },
  };
  const out = args.out || 'qr-bill.pdf';
  // swissqrbill v4 API
  try {
    const { PDF } = SwissQRBill;
    const pdf = new PDF(data, out, { autoGenerate: true });
    pdf.on('finish', () => console.log(`wrote ${out}`));
  } catch (e) {
    console.error(`swissqrbill generation failed: ${e.message}`);
    process.exit(1);
  }
}

if (require.main === module) main();
