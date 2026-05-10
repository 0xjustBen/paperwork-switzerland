// validate-uid.js — Validate Swiss IDE/UID (Numéro d'identification des entreprises).
// Legal reference: LIDE (Loi fédérale sur le numéro d'identification des entreprises, RS 431.03)
// and OIDE (RS 431.031). Format: CHE-XXX.XXX.XXX optionally followed by TVA/MWST/IVA/VAT.
// Check digit algorithm: Modulo 11 on the first 8 digits with weights [5,4,3,2,7,6,5,4].
// See: https://www.bfs.admin.ch/bfs/fr/home/registres/registre-entreprises/numero-identification-entreprises.html

const UID_RE = /^CHE-(\d{3})\.(\d{3})\.(\d{3})(?:\s(TVA|MWST|IVA|VAT))?$/;
const WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4];

/**
 * Validate a Swiss UID/IDE string. Returns true iff format AND Mod 11 checksum OK.
 * @param {string} uid e.g. "CHE-105.962.535 TVA"
 * @returns {boolean}
 */
export function validateUID(uid) {
  if (typeof uid !== 'string') return false;
  const m = uid.match(UID_RE);
  if (!m) return false;
  const digits = (m[1] + m[2] + m[3]).split('').map(Number);
  if (digits.length !== 9) return false;
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += WEIGHTS[i] * digits[i];
  let check = 11 - (sum % 11);
  if (check === 11) check = 0;
  if (check === 10) return false; // invalid per spec
  return check === digits[8];
}

function usage() {
  console.log(`Usage: node scripts/validate-uid.js <UID>

Validate a Swiss IDE/UID number (format + Mod 11 check digit).

Example:
  node scripts/validate-uid.js "CHE-105.962.535 TVA"

Exit codes: 0 = valid, 1 = invalid, 2 = usage error.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  if (!arg || arg === '--help' || arg === '-h') { usage(); process.exit(arg ? 0 : 2); }
  const ok = validateUID(arg);
  console.log(JSON.stringify({ uid: arg, valid: ok }));
  process.exit(ok ? 0 : 1);
}
