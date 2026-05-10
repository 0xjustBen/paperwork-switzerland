// import-bexio-invoices.js — Read a JSON list of bexio invoices and normalize to internal schema.
// Reference: bexio API v2 https://docs.bexio.com — `GET /2.0/kb_invoice` returns the schema mapped below.
// Internal schema is intentionally close to the validate-invoice.js shape (art. 26 LTVA).

/**
 * Normalize a single bexio invoice to internal schema.
 * @param {object} bx
 */
export function normalizeBexioInvoice(bx) {
  return {
    sourceId: bx.id,
    documentNumber: bx.document_nr || bx.nr,
    date: bx.is_valid_from || bx.document_date,
    dueDate: bx.is_valid_to,
    currency: bx.currency_code || 'CHF',
    supplier: { name: bx.own_company || null, uid: bx.own_uid || null, vatRegistered: !!bx.own_uid },
    recipient: { name: bx.contact_name || bx.contact?.name_1, locality: bx.contact?.city, address: bx.contact?.address },
    lines: (bx.positions || []).map((p) => ({
      description: p.text,
      quantity: Number(p.amount || 0),
      unitPrice: Number(p.unit_price || 0),
      vatRate: Number(p.tax_value || 0) / 100,
      total: Number(p.position_total || 0),
    })),
    subtotal: Number(bx.total_net || 0),
    vatAmount: Number(bx.total_taxes || 0),
    total: Number(bx.total_incl_tax || bx.total || 0),
    vatRate: bx.positions?.[0]?.tax_value ? Number(bx.positions[0].tax_value) / 100 : null,
    status: bx.kb_item_status_id,
  };
}

export function importBexioInvoices(bxList) {
  if (!Array.isArray(bxList)) throw new TypeError('expected array');
  return bxList.map(normalizeBexioInvoice);
}

function usage() {
  console.log(`Usage: node scripts/import-bexio-invoices.js <bexio-export.json> [--out out.json]

Read a JSON array of bexio invoice objects and write normalized internal-schema invoices.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) { usage(); process.exit(argv.length ? 0 : 1); }
  const file = argv[0];
  const outIdx = argv.indexOf('--out');
  const out = outIdx >= 0 ? argv[outIdx + 1] : null;
  const fs = await import('node:fs');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const normalized = importBexioInvoices(data);
  const json = JSON.stringify(normalized, null, 2);
  if (out) fs.writeFileSync(out, json);
  else console.log(json);
}
