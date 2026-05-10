# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-10

### Added

- Initial public release.
- **6 skills** covering Swiss bureaucracy:
  - `expert-fiscal` — Tax Expert (LIFD/DBG + 26 cantonal regimes)
  - `fiduciaire` — Trustee / Treuhänder (CO 957ff, VAT, payroll, year-end)
  - `notaire-cantonal` — Cantonal Notary (Latin / free / mixed systems)
  - `regie` — Property Manager (CO 253ff, CC 712a ff, OFL reference rate)
  - `reviseur-agree` — Licensed Auditor (CO 727 / 727a, FAOA)
  - `controleur-afc` — Tax Auditor (FTA / ESTV procedures)
- **26 canton data files** under `data/cantons/` (AG, AI, AR, BE, BL, BS, FR, GE, GL, GR, JU, LU, NE, NW, OW, SG, SH, SO, SZ, TG, TI, UR, VD, VS, ZG, ZH) with shared `_schema.json`.
- **Quadrilingual documentation**: `README`, `CONTRIBUTING`, and every `SKILL.md` shipped in EN / FR / DE / IT.
- **Deterministic JavaScript calculator** (`scripts/calc.js`) for VAT, IFD/DBST, combined cantonal corporate tax, mutation duty, AHV/BVG, and pro-rata.
- **Eval framework** (`evals/run_evals.py`) — LLM-as-judge, per-skill cases under `<skill>/evals/`.
- Integrations for **bexio**, **Stripe**, and **PostFinance** (ISO 20022 camt.053).
- Swiss **QR-bill** generator and validators for UID, IBAN, QR-reference, invoice structure.

[Unreleased]: https://github.com/0xjustBen/paperwork-switzerland/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/0xjustBen/paperwork-switzerland/releases/tag/v0.1.0
