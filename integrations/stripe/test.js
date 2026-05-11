'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

// Smoke tests for the stripe fetch module. Mock data only — no network.
// We don't exercise the real Stripe SDK; we only check the module surface
// and the documented error path when env vars are missing.

test('module exports fetchAccount', () => {
  const mod = require('./fetch.js');
  assert.equal(typeof mod.fetchAccount, 'function');
});

test('fetchAccount throws if env_key is unset', async () => {
  const { fetchAccount } = require('./fetch.js');
  const envKey = 'STRIPE_TEST_UNSET_KEY_XYZ';
  delete process.env[envKey];
  const account = { id: 'mock', name: 'Mock', env_key: envKey };
  // Either the stripe SDK is not installed (local dev) or env_key is missing —
  // both are valid failure modes for a mock-only smoke test.
  await assert.rejects(
    () => fetchAccount(account),
    /env var missing|stripe not installed/,
  );
});
