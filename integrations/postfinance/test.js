'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseCamt053 } = require('./parse.js');

const MOCK_CAMT = `<?xml version="1.0" encoding="UTF-8"?>
<Document>
  <BkToCstmrStmt>
    <Stmt>
      <Acct><Id><IBAN>CH9300762011623852957</IBAN></Id></Acct>
      <Ntry>
        <Amt Ccy="CHF">1234.50</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2026-05-01</Dt></BookgDt>
        <ValDt><Dt>2026-05-01</Dt></ValDt>
        <NtryDtls><TxDtls>
          <RmtInf><Ustrd>Invoice 2026-001</Ustrd></RmtInf>
          <RltdPties><Dbtr><Nm>ACME GmbH</Nm></Dbtr></RltdPties>
        </TxDtls></NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="CHF">42.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2026-05-02</Dt></BookgDt>
        <ValDt><Dt>2026-05-02</Dt></ValDt>
        <NtryDtls><TxDtls>
          <RmtInf><Ustrd>Bank fee</Ustrd></RmtInf>
        </TxDtls></NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

test('parseCamt053 returns expected shape', () => {
  const r = parseCamt053(MOCK_CAMT);
  assert.equal(r.account_iban, 'CH9300762011623852957');
  assert.equal(r.count, 2);
  assert.equal(r.transactions.length, 2);
});

test('parseCamt053 sets direction and signed amount', () => {
  const r = parseCamt053(MOCK_CAMT);
  const credit = r.transactions[0];
  const debit = r.transactions[1];
  assert.equal(credit.direction, 'credit');
  assert.equal(credit.amount, 1234.5);
  assert.equal(credit.currency, 'CHF');
  assert.equal(debit.direction, 'debit');
  assert.equal(debit.amount, -42);
});

test('parseCamt053 handles empty input safely', () => {
  const r = parseCamt053('<Document></Document>');
  assert.equal(r.count, 0);
  assert.deepEqual(r.transactions, []);
});
