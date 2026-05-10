// validate-qr-reference.js — Validate Swiss QR-bill reference (QRR).
// Legal reference: SIX "Swiss Implementation Guidelines QR-bill" v2.3, section "Reference type"
// (ISO 11649 Creditor Reference is the alternate "SCOR" type — handled separately).
// QRR is 27 digits; last digit is the Modulo 10 recursive check digit (ESR/BVR algorithm).
// See: https://www.paymentstandards.ch/

const MOD10_TABLE = [
  [0, 9, 4, 6, 8, 2, 7, 1, 3, 5],
  [9, 4, 6, 8, 2, 7, 1, 3, 5, 0],
  [4, 6, 8, 2, 7, 1, 3, 5, 0, 9],
  [6, 8, 2, 7, 1, 3, 5, 0, 9, 4],
  [8, 2, 7, 1, 3, 5, 0, 9, 4, 6],
  [2, 7, 1, 3, 5, 0, 9, 4, 6, 8],
  [7, 1, 3, 5, 0, 9, 4, 6, 8, 2],
  [1, 3, 5, 0, 9, 4, 6, 8, 2, 7],
  [3, 5, 0, 9, 4, 6, 8, 2, 7, 1],
  [5, 0, 9, 4, 6, 8, 2, 7, 1, 3],
];

/**
 * Mod 10 recursive computation per ESR/BVR specification.
 * @param {string} digits string of decimal digits
 * @returns {number} check digit 0..9
 */
export function mod10Recursive(digits) {
  let carry = 0;
  for (const ch of digits) carry = MOD10_TABLE[carry][Number(ch)];
  return (10 - carry) % 10;
}

/**
 * Validate a Swiss QR reference (QRR): exactly 27 digits, last is Mod 10 recursive check.
 * @param {string} ref
 * @returns {boolean}
 */
export function validateQRReference(ref) {
  if (typeof ref !== 'string') return false;
  const s = ref.replace(/\s+/g, '');
  if (!/^\d{27}$/.test(s)) return false;
  const body = s.slice(0, 26);
  const check = Number(s.slice(26));
  return mod10Recursive(body) === check;
}

function usage() {
  console.log(`Usage: node scripts/validate-qr-reference.js <QRR>

Validate Swiss QR-bill reference (27 digits, Mod 10 recursive).

Example:
  node scripts/validate-qr-reference.js 210000000003139471430009017

Exit codes: 0 = valid, 1 = invalid, 2 = usage error.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  if (!arg || arg === '--help' || arg === '-h') { usage(); process.exit(arg ? 0 : 2); }
  const ok = validateQRReference(arg);
  console.log(JSON.stringify({ reference: arg, valid: ok }));
  process.exit(ok ? 0 : 1);
}
