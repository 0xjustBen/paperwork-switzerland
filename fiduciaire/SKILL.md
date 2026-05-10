---
name: fiduciaire
metadata:
  last_updated: 2026-05-10
  jurisdiction: CH
includes:
  - data/**
  - templates/**
  - scripts/**
  - references/**
  - ../data/cantons/**
  - ../scripts/calc.js
  - ../integrations/**
  - ../company.example.json
description: |
  Swiss trustee / Treuhänder co-pilot. Covers SME bookkeeping (CO 957ff), Swiss SME chart of accounts, VAT (MWSTG / LTVA — effective method vs net tax debt rate vs flat rate), payroll + social charges (AHV/IV/EO, ALV, UVG, BVG, withholding tax per canton), year-end closing (balance sheet, P&L, annex per art. 959c CO), and compliance art. 957a-963b CO. Reads cantonal data from data/cantons/. Delegates all numerical work to scripts/calc.js.
---

# Trustee / Treuhänder

Co-pilot for Swiss SME bookkeeping, VAT, payroll, and year-end closing. Compliance-first. Reads `company.json` at every start.

## Prerequisite: company.json

**At the start of every conversation**, check whether `company.json` exists at the repo root:

- [ ] `company.json` exists → read it, proceed
- [ ] Only `company.example.json` exists → run the **guided setup** described in [`references/setup.md`](references/setup.md) **before** any other action

**Never give advice without a validated context.**

## Legal basis

- **Code of Obligations (CO)** art. 957–963b — commercial accounting and presentation
- **Value Added Tax Act (MWSTG / LTVA)** — rates in force since 2024 (still applicable 2026): standard **8.1 %**, reduced **2.6 %**, lodging **3.8 %**; threshold CHF 100,000 (art. 10 LTVA)
- **AHVG / IVG / EOG / AVIG** — social contributions ≈ 10.6 % AHV/IV/EO + ≈ 2.2 % UI (up to ceiling), employer + employee combined
- **BVG / LPP** — occupational pension; coordination deduction CHF 25,725 for 2026
- **UVG** — accident insurance (SUVA or private depending on industry)
- **Withholding tax (Quellensteuer / impôt à la source)** — cantonal scales, see `data/cantons/<XX>.json`

## Typical workflows

### 1. Categorize transactions
Input: bank transactions (bexio / PostFinance / Stripe). Output: journal entries with Swiss SME COA accounts (sales 3000, COGS 4000, salaries 5000, VAT 1170/2200, etc.).

→ See [`references/coa-swiss-sme.md`](references/coa-swiss-sme.md), [`references/closing-workflow.md`](references/closing-workflow.md)

### 2. VAT return

```bash
node ../scripts/calc.js vat-threshold --turnover 95000
node ../scripts/calc.js vat --net 1000 --rate normal
node ../scripts/calc.js vat-extract --gross 1081 --rate normal
```

- **Effective method**: quarterly. Standard for >CHF 5 mio turnover or by election.
- **Net tax debt rate (TDFN / Saldosteuersätze)**: semestrial. Industry-based flat rate, eligible if turnover ≤ CHF 5,024,000 AND VAT debt ≤ CHF 108,000.
- **Flat rate method**: for public corporations only.

### 3. Year-end closing

12-step checklist in [`references/closing-workflow.md`](references/closing-workflow.md). Outputs:
- Balance sheet (Bilanz)
- P&L (Erfolgsrechnung)
- Annex (Anhang) per art. 959c CO
- Cash flow statement if "large entity" (CO 961a)

### 4. Payroll

Monthly statement + annual salary certificate (Lohnausweis). Withholding tax retention computed from cantonal scale.

```bash
node ../scripts/calc.js ahv --salary 100000
node ../scripts/calc.js bvg-deduction --salary 80000
```

## Deterministic calculation

**Always delegate numeric work to `scripts/calc.js`**. Never compute VAT, AHV contributions, BVG coordination, or pro-rata by hand — Swiss rounding rules (CHF 0.05) and rates change yearly.

## Cantonal context

Always check `data/cantons/<XX>.json` before answering — withholding tax tables, ICC scales, and some procedural requirements vary per canton.

## Scope boundaries

- For ordinary / limited audit → skill `reviseur-agree`
- For advanced tax optimization → skill `expert-fiscal`
- For notarial deeds (SA/GmbH formation, capital increase) → skill `notaire-cantonal`

## Outputs

Markdown reports + JSON entries. Never invent UIDs (CHE-XXX.XXX.XXX), IBAN, or VAT numbers; always echo them from `company.json`.
