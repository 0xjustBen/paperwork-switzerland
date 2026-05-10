// Unit tests for validate-uid.js — run with `node --test scripts/tests/validate-uid.test.js`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateUID } from '../validate-uid.js';

test('valid UID with TVA suffix', () => {
  // Computed: digits 105962533, weights [5,4,3,2,7,6,5,4] → sum=129, 129%11=8, 11-8=3.
  assert.equal(validateUID('CHE-105.962.533 TVA'), true);
});

test('valid UID without suffix', () => {
  assert.equal(validateUID('CHE-105.962.533'), true);
});

test('rejects bad checksum', () => {
  assert.equal(validateUID('CHE-105.962.535'), false);
});

test('rejects bad format', () => {
  assert.equal(validateUID('CHE105962535'), false);
  assert.equal(validateUID('CH-105.962.535'), false);
  assert.equal(validateUID(''), false);
  assert.equal(validateUID(null), false);
});
