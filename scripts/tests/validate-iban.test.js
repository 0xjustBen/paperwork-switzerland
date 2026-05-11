// Unit tests for validate-iban.js — run with `node --test scripts/tests/validate-iban.test.js`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateIBAN } from '../validate-iban.js';

test('valid Swiss IBAN (canonical example)', () => {
  assert.equal(validateIBAN('CH9300762011623852957'), true);
  assert.equal(validateIBAN('CH93 0076 2011 6238 5295 7'), true);
});

test('rejects bad check digits', () => {
  assert.equal(validateIBAN('CH9400762011623852957'), false);
});

test('rejects wrong length / country', () => {
  assert.equal(validateIBAN('CH930076201162385295'), false);
  assert.equal(validateIBAN('DE89370400440532013000'), false);
  assert.equal(validateIBAN(''), false);
  assert.equal(validateIBAN(undefined), false);
});
