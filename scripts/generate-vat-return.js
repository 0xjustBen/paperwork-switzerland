// generate-vat-return.js — Produce an ESTV/AFC quarterly VAT return (Form 0550) as JSON.
// Legal reference: LTVA (RS 641.20) art. 71-72 (déclaration), OTVA (RS 641.201).
// Supports two computation methods:
//   - "effective" (art. 36 LTVA): output tax minus input tax (impôt préalable).
//   - "TDFN" / forfait (art. 37 LTVA): taux de la dette fiscale nette; flat rate applied to
//     gross turnover, no input-tax deduction. Rates are sector-specific (provided per entry).
// 2024+ rates: standard 8.1%, reduced 2.6%, special accommodation 3.8%.

const STANDARD_RATES = { standard: 0.081, reduced: 0.026, accommodation: 0.038, exempt: 0, zero: 0 };

/**
 * @typedef {{date:string, type:'sale'|'purchase', amount:number, rate?:'standard'|'reduced'|'accommodation'|'exempt'|'zero', vat?:number, deductible?:boolean, tdfnRate?:number}} Entry
 */

/**
 * Generate a VAT return summary from a bookkeeping array.
 * @param {Entry[]} entries
 * @param {{method?:'effective'|'TDFN', period:string, uid:string}} opts
 * @returns {object} ESTV Form 0550 field map
 */
export function generateVATReturn(entries, opts) {
  if (!Array.isArray(entries)) throw new TypeError('entries must be an array');
  const method = opts?.method || 'effective';
  const period = opts?.period || '';
  const uid = opts?.uid || '';

  let caTotal = 0;
  const caByRate = { standard: 0, reduced: 0, accommodation: 0, exempt: 0, zero: 0 };
  let outputTax = 0;
  let inputTax = 0;
  let tdfnTax = 0;

  for (const e of entries) {
    const rate = e.rate || 'standard';
    if (e.type === 'sale') {
      caTotal += e.amount;
      caByRate[rate] = (caByRate[rate] || 0) + e.amount;
      if (method === 'effective') {
        const r = STANDARD_RATES[rate] ?? 0;
        // amounts assumed VAT-exclusive net; if inclusive use e.vat directly.
        outputTax += e.vat != null ? e.vat : e.amount * r;
      } else {
        // TDFN: flat rate on gross (VAT-inclusive) turnover; rate provided per entry.
        const r = e.tdfnRate ?? 0;
        tdfnTax += e.amount * r;
      }
    } else if (e.type === 'purchase' && method === 'effective' && e.deductible !== false) {
      inputTax += e.vat || 0;
    }
  }

  const taxDue = method === 'effective' ? outputTax - inputTax : tdfnTax;

  return {
    form: '0550',
    period,
    uid,
    method,
    // ESTV field numbers (subset — full form has ~40 fields)
    fields: {
      '200_ca_total': round2(caTotal),
      '220_ca_exempt': round2(caByRate.exempt + caByRate.zero),
      '299_ca_imposable': round2(caTotal - caByRate.exempt - caByRate.zero),
      '301_ca_taux_normal': round2(caByRate.standard),
      '311_ca_taux_reduit': round2(caByRate.reduced),
      '341_ca_hebergement': round2(caByRate.accommodation),
      '400_impot_brut': round2(outputTax || tdfnTax),
      '405_tdfn_impot': round2(tdfnTax),
      '500_impot_prealable_mat': round2(method === 'effective' ? inputTax : 0),
      '900_impot_du': round2(taxDue),
    },
  };
}

const round2 = (n) => Math.round(n * 100) / 100;

function usage() {
  console.log(`Usage: node scripts/generate-vat-return.js <entries.json> [--method effective|TDFN] [--period 2025Q1] [--uid CHE-...]

Reads a bookkeeping JSON array of entries (sales/purchases) and outputs ESTV Form 0550
field values. Methods: 'effective' (art. 36 LTVA, default) or 'TDFN' (art. 37 LTVA).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) { usage(); process.exit(argv.length ? 0 : 1); }
  const file = argv[0];
  const opts = { method: 'effective', period: '', uid: '' };
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '--method') opts.method = argv[++i];
    else if (argv[i] === '--period') opts.period = argv[++i];
    else if (argv[i] === '--uid') opts.uid = argv[++i];
  }
  const fs = await import('node:fs');
  const entries = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(JSON.stringify(generateVATReturn(entries, opts), null, 2));
}
