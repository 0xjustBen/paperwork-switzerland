// validate-iban.js — Validate Swiss IBAN (CH##).
// Legal reference: ISO 13616 and SIX Interbank Clearing standards.
// Swiss IBAN is exactly 21 chars: CH + 2 check digits + 5-digit clearing + 12-char account.
// Algorithm: ISO 7064 Mod 97-10 — move 4 leading chars to end, letters -> A=10..Z=35, mod 97 == 1.

const CH_IBAN_RE = /^CH\d{19}$/;

/**
 * Validate a Swiss IBAN. Spaces are stripped; case is normalized.
 * @param {string} iban e.g. "CH93 0076 2011 6238 5295 7"
 * @returns {boolean}
 */
export function validateIBAN(iban) {
  if (typeof iban !== 'string') return false;
  const s = iban.replace(/\s+/g, '').toUpperCase();
  if (!CH_IBAN_RE.test(s)) return false;
  const rearranged = s.slice(4) + s.slice(0, 4);
  let num = '';
  for (const ch of rearranged) {
    num += /[A-Z]/.test(ch) ? (ch.charCodeAt(0) - 55).toString() : ch;
  }
  // Mod 97 over potentially-long numeric string, chunked to avoid BigInt requirement.
  let rem = 0;
  for (let i = 0; i < num.length; i += 7) {
    rem = Number(String(rem) + num.slice(i, i + 7)) % 97;
  }
  return rem === 1;
}

function usage() {
  console.log(`Usage: node scripts/validate-iban.js <IBAN>

Validate a Swiss IBAN (format + ISO 7064 Mod 97 check).

Example:
  node scripts/validate-iban.js "CH9300762011623852957"

Exit codes: 0 = valid, 1 = invalid, 2 = usage error.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  if (!arg || arg === '--help' || arg === '-h') { usage(); process.exit(arg ? 0 : 2); }
  const ok = validateIBAN(arg);
  console.log(JSON.stringify({ iban: arg, valid: ok }));
  process.exit(ok ? 0 : 1);
}
