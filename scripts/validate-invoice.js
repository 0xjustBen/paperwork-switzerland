// validate-invoice.js — Validate Swiss VAT invoice mandatory mentions.
// Legal reference: art. 26 LTVA (RS 641.20) — content of an invoice from a taxable person.
// Required elements (al. 2):
//   a. name + locality of supplier; UID (CHE-...) if registered for VAT
//   b. name + locality of recipient (as appearing in commerce)
//   c. date or period of supply (if different from invoice date)
//   d. type, object, extent of the supply
//   e. consideration (price)
//   f. VAT rate applied and amount; if price is VAT-inclusive, mention of inclusion suffices.

import { validateUID } from './validate-uid.js';

/**
 * Validate a Swiss invoice object against art. 26 LTVA.
 * @param {object} inv invoice object
 * @returns {{valid:boolean, missing:string[], warnings:string[]}}
 */
export function validateInvoice(inv) {
  const missing = [];
  const warnings = [];
  if (!inv || typeof inv !== 'object') {
    return { valid: false, missing: ['invoice object'], warnings: [] };
  }

  // a) supplier
  if (!inv.supplier?.name) missing.push('supplier.name');
  if (!inv.supplier?.locality && !inv.supplier?.address) missing.push('supplier.locality');
  if (inv.supplier?.vatRegistered) {
    if (!inv.supplier.uid) missing.push('supplier.uid (CHE-...)');
    else if (!validateUID(inv.supplier.uid)) warnings.push('supplier.uid format/checksum invalid');
  }

  // b) recipient
  if (!inv.recipient?.name) missing.push('recipient.name');
  if (!inv.recipient?.locality && !inv.recipient?.address) missing.push('recipient.locality');

  // c) date / period
  if (!inv.date && !inv.period) missing.push('date or period of supply');

  // d) description
  if (!inv.description && !(Array.isArray(inv.lines) && inv.lines.length))
    missing.push('description or lines (type/object/extent)');

  // e) consideration
  if (inv.total == null && inv.amount == null) missing.push('total / amount (consideration)');

  // f) VAT rate + amount (unless explicitly out of scope / exempt)
  const exempt = inv.vatExempt === true || inv.outOfScope === true;
  if (!exempt) {
    if (inv.vatRate == null) missing.push('vatRate');
    if (inv.vatAmount == null && inv.vatIncluded !== true)
      missing.push('vatAmount (or vatIncluded=true with mention)');
  }

  // Sanity warnings
  if (inv.currency && !/^[A-Z]{3}$/.test(inv.currency))
    warnings.push('currency should be ISO 4217 (e.g. CHF, EUR)');
  if (inv.total != null && inv.total < 0)
    warnings.push('negative total — issue a credit note instead?');

  return { valid: missing.length === 0, missing, warnings };
}

function usage() {
  console.log(`Usage: node scripts/validate-invoice.js <invoice.json>

Validate a Swiss VAT invoice against art. 26 LTVA mandatory mentions.

Reads JSON from path argument or stdin. Prints {valid, missing, warnings}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  if (arg === '--help' || arg === '-h') { usage(); process.exit(0); }
  const fs = await import('node:fs');
  const raw = arg ? fs.readFileSync(arg, 'utf8') : fs.readFileSync(0, 'utf8');
  const result = validateInvoice(JSON.parse(raw));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.valid ? 0 : 1);
}
