# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

Please report security issues privately via [GitHub Security Advisories](https://github.com/0xjustBen/paperwork-switzerland/security/advisories/new) (the "Report a vulnerability" button on the Security tab).

Do **not** open public issues for security reports.

## Disclosure Window

- Acknowledgement target: 7 days
- Fix or mitigation target: 90 days from acknowledgement
- Coordinated public disclosure once a patched release is available

## Scope

In scope:

- Determinism / correctness of `scripts/calc.js` and the per-skill calculators
- Integrity of canton data files under `data/cantons/` and skill-level `data/`
- Validators (`scripts/validate-uid.js`, `validate-iban.js`, `validate-qr-reference.js`, `validate-invoice.js`)
- Template content that could mislead users about Swiss legal/fiscal obligations

Out of scope:

- Issues in upstream dependencies — please report those upstream first
- Use of templates as legal advice (templates are illustrative, not advice)
- Numeric values flagged with `_disclaimer` — these are sample/illustrative
