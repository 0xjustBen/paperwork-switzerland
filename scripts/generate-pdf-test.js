// End-to-end test for generate-pdfs.js — markdown template → PDF (or stub).
//
// If puppeteer is not installed, accepts the stub output but still asserts
// the pipeline produces a non-empty file. If puppeteer is installed, asserts
// the output is a real PDF > 1 KB.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync, unlinkSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMarkdownToPDF } from './generate-pdfs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(__dirname, '..', 'templates', 'pv-ag-annuelle-sa.md');
const OUT = '/tmp/test.pdf';

let puppeteerInstalled = false;
try {
  await import('puppeteer');
  puppeteerInstalled = true;
} catch {
  puppeteerInstalled = false;
}

test('pipeline produces an output file from a markdown template', async () => {
  assert.ok(existsSync(TEMPLATE), `template not found: ${TEMPLATE}`);
  if (existsSync(OUT)) unlinkSync(OUT);

  const result = await renderMarkdownToPDF(TEMPLATE, OUT);
  assert.ok(existsSync(OUT), 'output file not created');

  const size = statSync(OUT).size;

  if (!puppeteerInstalled) {
    // SKIP real-PDF assertion; only validate the stub pipeline worked.
    console.log('SKIP real-PDF assertion: puppeteer not installed (engine=stub).');
    assert.equal(result.engine, 'stub');
    assert.ok(size > 0, 'stub file is empty');
    return;
  }

  assert.equal(result.engine, 'puppeteer');
  assert.ok(size > 1024, `expected PDF > 1KB, got ${size} bytes`);
  const head = readFileSync(OUT).subarray(0, 5).toString('utf-8');
  assert.equal(head, '%PDF-', `not a PDF header: ${head}`);
});
