// upload-bexio-attachments.js — Upload PDF attachments to bexio via REST API.
// Reference: bexio API v2 — POST /3.0/files (multipart) and link via POST /2.0/kb_invoice/{id}/file.
// This is a skeleton: requires BEXIO_API_KEY env var. Supports --dry-run for safety.

import { readFileSync, statSync } from 'node:fs';
import { basename } from 'node:path';

const API_BASE = process.env.BEXIO_API_BASE || 'https://api.bexio.com';

export async function uploadAttachment({ file, invoiceId, dryRun = false, apiKey = process.env.BEXIO_API_KEY }) {
  if (!apiKey && !dryRun) throw new Error('BEXIO_API_KEY env var required (or use --dry-run)');
  const stat = statSync(file);
  const name = basename(file);
  if (dryRun) {
    return { dryRun: true, file: name, size: stat.size, invoiceId, wouldPOST: `${API_BASE}/3.0/files` };
  }
  const buf = readFileSync(file);
  const blob = new Blob([buf], { type: 'application/pdf' });
  const fd = new FormData();
  fd.append('file', blob, name);
  const upload = await fetch(`${API_BASE}/3.0/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    body: fd,
  });
  if (!upload.ok) throw new Error(`bexio upload failed: ${upload.status} ${await upload.text()}`);
  const fileResp = await upload.json();
  if (invoiceId) {
    const link = await fetch(`${API_BASE}/2.0/kb_invoice/${invoiceId}/file`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileResp.id }),
    });
    if (!link.ok) throw new Error(`bexio link failed: ${link.status} ${await link.text()}`);
  }
  return { file: name, size: stat.size, fileId: fileResp.id, invoiceId };
}

function usage() {
  console.log(`Usage: node scripts/upload-bexio-attachments.js <pdf> [--invoice <id>] [--dry-run]

Env: BEXIO_API_KEY (required unless --dry-run).

Uploads a PDF to bexio and optionally links it to an invoice document.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) { usage(); process.exit(argv.length ? 0 : 1); }
  const file = argv[0];
  const invoiceId = argv.includes('--invoice') ? argv[argv.indexOf('--invoice') + 1] : null;
  const dryRun = argv.includes('--dry-run');
  const result = await uploadAttachment({ file, invoiceId, dryRun });
  console.log(JSON.stringify(result, null, 2));
}
