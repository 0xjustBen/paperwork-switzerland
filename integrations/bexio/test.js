'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

// Smoke tests for the bexio fetch module. Mock data only — no network.
// We stub global.fetch and inject BEXIO_API_TOKEN so getHeaders() succeeds.

const ORIGINAL_FETCH = global.fetch;
const ORIGINAL_TOKEN = process.env.BEXIO_API_TOKEN;

before(() => {
  process.env.BEXIO_API_TOKEN = 'test-token';
});

after(() => {
  global.fetch = ORIGINAL_FETCH;
  if (ORIGINAL_TOKEN === undefined) delete process.env.BEXIO_API_TOKEN;
  else process.env.BEXIO_API_TOKEN = ORIGINAL_TOKEN;
});

function mockFetch(payload) {
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    // Return one full page on the first call, empty on subsequent to terminate pagination.
    const body = calls === 1 ? payload : [];
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => body,
    };
  };
}

test('module exports the expected functions', () => {
  const mod = require('./fetch.js');
  assert.equal(typeof mod.fetchContacts, 'function');
  assert.equal(typeof mod.fetchInvoices, 'function');
  assert.equal(typeof mod.fetchBankAccounts, 'function');
});

test('fetchContacts returns array from mocked fetch', async () => {
  const { fetchContacts } = require('./fetch.js');
  mockFetch([{ id: 1, name_1: 'ACME' }]);
  const r = await fetchContacts();
  assert.ok(Array.isArray(r));
  assert.equal(r.length, 1);
  assert.equal(r[0].name_1, 'ACME');
});

test('fetchInvoices forwards date range without throwing', async () => {
  const { fetchInvoices } = require('./fetch.js');
  let capturedUrl = null;
  global.fetch = async (url) => {
    capturedUrl = String(url);
    return { ok: true, status: 200, statusText: 'OK', json: async () => [] };
  };
  const r = await fetchInvoices('2026-01-01', '2026-12-31');
  assert.deepEqual(r, []);
  assert.match(capturedUrl, /date_from=2026-01-01/);
  assert.match(capturedUrl, /date_to=2026-12-31/);
});

test('fetch throws helpful error when API returns non-ok', async () => {
  const { fetchBankAccounts } = require('./fetch.js');
  global.fetch = async () => ({ ok: false, status: 401, statusText: 'Unauthorized' });
  await assert.rejects(() => fetchBankAccounts(), /bexio API 401/);
});
