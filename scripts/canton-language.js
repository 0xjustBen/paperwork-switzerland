#!/usr/bin/env node
/**
 * Canton → language(s) helper.
 *
 * Codes follow ISO 3166-2:CH. Languages follow BCP-47 short codes:
 *   de = German, fr = French, it = Italian, rm = Romansh.
 *
 * Source: Federal Constitution, art. 70 — official languages of cantons.
 */

export const CANTON_LANGUAGES = {
  ZH: ['de'], BE: ['de', 'fr'], LU: ['de'], UR: ['de'], SZ: ['de'],
  OW: ['de'], NW: ['de'], GL: ['de'], ZG: ['de'], FR: ['fr', 'de'],
  SO: ['de'], BS: ['de'], BL: ['de'], SH: ['de'], AR: ['de'],
  AI: ['de'], SG: ['de'], GR: ['de', 'rm', 'it'], AG: ['de'], TG: ['de'],
  TI: ['it'], VD: ['fr'], VS: ['fr', 'de'], NE: ['fr'], GE: ['fr'],
  JU: ['fr'],
};

function normalize(canton) {
  if (!canton) throw new Error('canton code required');
  const upper = String(canton).toUpperCase().trim();
  if (!(upper in CANTON_LANGUAGES)) {
    throw new Error(`unknown canton '${canton}'`);
  }
  return upper;
}

export function languagesFor(canton) {
  return [...CANTON_LANGUAGES[normalize(canton)]];
}

export function primaryLanguage(canton) {
  return CANTON_LANGUAGES[normalize(canton)][0];
}

export function isMultilingual(canton) {
  return CANTON_LANGUAGES[normalize(canton)].length > 1;
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const code = process.argv[2];
  if (!code || code === '--help' || code === '-h') {
    console.log('Usage: node scripts/canton-language.js <CANTON_CODE>');
    process.exit(code ? 0 : 1);
  }
  try {
    const upper = normalize(code);
    const result = {
      canton: upper,
      languages: languagesFor(upper),
      primary: primaryLanguage(upper),
      multilingual: isMultilingual(upper),
    };
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exit(2);
  }
}
