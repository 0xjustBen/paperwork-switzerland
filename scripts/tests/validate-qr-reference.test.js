// Unit tests for validate-qr-reference.js — run with `node --test scripts/tests/validate-qr-reference.test.js`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateQRReference, mod10Recursive } from '../validate-qr-reference.js';

test('mod10Recursive of canonical example', () => {
  // Standard SIX test vector: body "21000000000313947143000901" → check 7
  assert.equal(mod10Recursive('21000000000313947143000901'), 7);
});

test('valid 27-digit QRR', () => {
  assert.equal(validateQRReference('210000000003139471430009017'), true);
});

test('rejects wrong check digit', () => {
  assert.equal(validateQRReference('210000000003139471430009010'), false);
});

test('rejects bad length / non-numeric', () => {
  assert.equal(validateQRReference('123'), false);
  assert.equal(validateQRReference('21000000000313947143000901A'), false);
  assert.equal(validateQRReference(''), false);
  assert.equal(validateQRReference(null), false);
});
