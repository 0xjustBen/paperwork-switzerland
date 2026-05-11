import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CANTON_LANGUAGES,
  primaryLanguage,
  isMultilingual,
  languagesFor,
} from '../canton-language.js';

const ALL_26 = [
  'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR',
  'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG',
  'TI', 'VD', 'VS', 'NE', 'GE', 'JU',
];

test('has all 26 cantons', () => {
  assert.equal(Object.keys(CANTON_LANGUAGES).length, 26);
  for (const c of ALL_26) {
    assert.ok(c in CANTON_LANGUAGES, `missing ${c}`);
  }
});

test('every canton has at least one language', () => {
  for (const c of ALL_26) {
    const langs = languagesFor(c);
    assert.ok(Array.isArray(langs) && langs.length >= 1, `${c} has no langs`);
    for (const l of langs) {
      assert.match(l, /^(de|fr|it|rm)$/, `${c} bad lang ${l}`);
    }
  }
});

test('primaryLanguage returns first language', () => {
  assert.equal(primaryLanguage('ZH'), 'de');
  assert.equal(primaryLanguage('GE'), 'fr');
  assert.equal(primaryLanguage('TI'), 'it');
  assert.equal(primaryLanguage('BE'), 'de');
  assert.equal(primaryLanguage('FR'), 'fr');
  assert.equal(primaryLanguage('GR'), 'de');
  assert.equal(primaryLanguage('VS'), 'fr');
});

test('isMultilingual correct for known cases', () => {
  // Officially multilingual cantons: BE, FR, GR, VS.
  assert.equal(isMultilingual('BE'), true);
  assert.equal(isMultilingual('FR'), true);
  assert.equal(isMultilingual('GR'), true);
  assert.equal(isMultilingual('VS'), true);
  // Monolingual examples.
  assert.equal(isMultilingual('ZH'), false);
  assert.equal(isMultilingual('GE'), false);
  assert.equal(isMultilingual('TI'), false);
  assert.equal(isMultilingual('JU'), false);
});

test('case-insensitive input', () => {
  assert.equal(primaryLanguage('zh'), 'de');
  assert.equal(primaryLanguage(' Ge '), 'fr');
});

test('languagesFor returns a copy (not the internal array)', () => {
  const a = languagesFor('GR');
  a.push('xx');
  assert.deepEqual(languagesFor('GR'), ['de', 'rm', 'it']);
});

test('throws on unknown canton', () => {
  assert.throws(() => primaryLanguage('XX'), /unknown canton/);
  assert.throws(() => languagesFor('USA'), /unknown canton/);
  assert.throws(() => isMultilingual(''), /canton code required/);
  assert.throws(() => primaryLanguage(null), /canton code required/);
});
