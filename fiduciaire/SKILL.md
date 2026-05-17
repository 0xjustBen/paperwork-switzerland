---
name: fiduciaire
metadata:
  last_updated: 2026-05-17
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
  Swiss trustee / fiduciaire / Treuhänder / fiduciario co-pilot for SME bookkeeping, VAT, payroll, year-end closing.
  Use when the user mentions: SME accounting (comptabilité PME, KMU-Buchhaltung), Swiss SME chart of accounts (PCG suisse, KMU-Kontenrahmen), VAT return (décompte TVA, MWST-Abrechnung), saldo / net-tax-debt rate (TDFN / Saldosteuersatz), payroll (salaires, Lohnbuchhaltung), social contributions (AHV/AVS, IV/AI, EO/APG, ALV/AC, UVG/LAA, BVG/LPP), withholding tax (Quellensteuer / impôt à la source), Lohnausweis / certificat de salaire, year-end closing (bouclement, Jahresabschluss), Anhang / annexe per CO 959c, bexio / Abacus / Banana / PostFinance import, UID / CHE number, ZEFIX, e-invoicing QR-bill.
  Covers CO 957–963b (commercial accounting), LTVA/MWSTG (8.1 % / 2.6 % / 3.8 %, CHF 100k threshold), AHVG/IVG/EOG/AVIG, BVG, UVG, cantonal withholding scales.
  Compliance-first. Reads company.json at every start. Delegates all numeric work to scripts/calc.js. NOT for audit (→ reviseur-agree), NOT for advanced optimization (→ expert-fiscal).
---

# Trustee / Fiduciaire / Treuhänder

Co-pilot for Swiss SME bookkeeping, VAT, payroll, year-end closing. Compliance-first. Reads `company.json` at every start.

## When to invoke

Trigger on: categorize bank transactions, draft VAT return, run payroll, compute social charges, prepare year-end closing, fill Lohnausweis, threshold checks (VAT registration, large-entity status), Anhang preparation, QR-bill issuance, bexio/Abacus reconciliation.

## Prerequisite: company.json

**At start of every conversation** check repo root:

- [ ] `company.json` exists → read, proceed.
- [ ] Only `company.example.json` → run **guided setup** in [`references/setup.md`](references/setup.md) **before** any other action.

**Never advise without validated context.**

## Workflow

1. Load `company.json` (UID, VAT regime, cantonal data, BVG plan, salary mass).
2. Load cantonal data: `data/cantons/<XX>.json` (WHT scales, ICC, conciliation).
3. Match task to workflow below.
4. **Delegate numeric work to `scripts/calc.js`** (never compute Swiss VAT, AHV, BVG, CHF 0.05 rounding by hand — rates change yearly).
5. Output: journal entries / report / form + legal basis + cantonal context.

## Legal basis

- **Code of Obligations (CO)** art. 957–963b — commercial accounting, presentation, audit duty thresholds.
- **VAT (MWSTG / LTVA)** — rates 2024+: standard **8.1 %**, reduced **2.6 %**, lodging **3.8 %**; registration threshold **CHF 100,000** turnover (art. 10 LTVA). Sport/culture associations / public-utility: CHF 250,000.
- **AHVG / IVG / EOG / AVIG** — AHV/IV/EO **10.6 %** (5.3 % each), AC **2.2 %** up to CHF 148,200 + **1 %** solidarity above, employer + employee combined.
- **BVG / LPP** — coordination deduction **CHF 25,725** (2026); entry threshold **CHF 22,680**; ceiling **CHF 88,200** mandatory.
- **UVG** — accident: occupational + non-occupational (NBU). SUVA or private depending on industry.
- **Withholding tax / Quellensteuer** — cantonal scales, see `data/cantons/<XX>.json`. NOV threshold **CHF 120,000**.
- **Stamp duty** — issuance 1 % above CHF 1m franchise (LT 6).

## Typical workflows

### 1. Categorize transactions

Input: bank transactions (bexio / PostFinance / Stripe / Wise). Output: journal entries with Swiss SME COA accounts:
- Sales: 3000–3999
- COGS: 4000–4999
- Personnel: 5000–5999 (gross), 5700 (employer social)
- Other operating: 6000–6999
- VAT due: 2200, VAT recoverable: 1170, VAT regime account: 2201
- Receivables: 1100, Payables: 2000

→ [`references/coa-swiss-sme.md`](references/coa-swiss-sme.md), [`references/closing-workflow.md`](references/closing-workflow.md).

### 2. VAT return

```bash
node ../scripts/calc.js vat-threshold --turnover 95000
node ../scripts/calc.js vat --net 1000 --rate normal
node ../scripts/calc.js vat-extract --gross 1081 --rate normal
```

| Method | Frequency | Eligibility | Trade-off |
|---|---|---|---|
| **Effective** | Quarterly | Default; mandatory > CHF 5m turnover | Input-tax recovery, more admin |
| **Net-tax-rate (TDFN / Saldosteuersatz)** | Semi-annual | Turnover ≤ **CHF 5,024,000** AND VAT debt ≤ **CHF 108,000** | Flat industry rate, no input-tax separate |
| **Flat-rate** | Semi-annual | Public entities only | — |

Commitment: 3 years minimum effective method, 1 year for net-tax-rate (since 2024 revision).

### 3. Year-end closing

12-step checklist in [`references/closing-workflow.md`](references/closing-workflow.md). Required outputs:
- **Balance sheet** (Bilanz / Bilan)
- **P&L** (Erfolgsrechnung / Compte de résultat)
- **Annex** (Anhang / Annexe) per CO 959c
- **Cash-flow statement** if **large entity** (CO 961a — 2/3: assets ≥ CHF 20m, turnover ≥ CHF 40m, ≥ 250 FTE) OR public company
- **Management report** if large entity (CO 961c)

### 4. Payroll

```bash
node ../scripts/calc.js ahv --salary 100000
node ../scripts/calc.js bvg-deduction --salary 80000
node ../scripts/calc.js withholding --canton GE --salary 7500 --tariff A0N
```

Annual: **Lohnausweis** (Form 11) per employee, copy to AVS + canton.

## Deterministic calculation

**Always delegate numeric work to `scripts/calc.js`**. Rates change yearly:
- 2024: VAT rates raised (7.7→8.1, 2.5→2.6, 3.7→3.8).
- BVG coordination + threshold change every year.
- AHV ceiling for AC adjusts 2-yearly.

## Cantonal context

Check `data/cantons/<XX>.json` before answering — WHT tables, ICC scales, registration formalities, e-filing portal URLs vary per canton.

## Edge cases

- **Mixed-use VAT** (LTVA 30): input-tax correction proportional. Document allocation key.
- **Vehicle private share**: 0.9 % / month of purchase price ex-VAT → salary supplement on Lohnausweis + VAT self-supply.
- **Home office allowance**: deductible if ≥ 40 % work-from-home (cantonal practice).
- **13th-month salary**: pro-rata on partial-year departure (CO 322 al. 2).
- **Holiday pay on hourly wage**: 8.33 % (4 wk) / 10.64 % (5 wk) explicit on payslip — else employer pays twice (TF case-law).
- **Quellensteuer NOV opt-in**: voluntary if salary < CHF 120k and quasi-resident — deadline 31 March year+1.
- **UID activation**: VAT registration **before** first invoice above threshold; retroactive registration possible but penalty risk.
- **AHV-pflichtige Lohnsumme < AHV-Lohn**: usual gap — fringe benefits + private vehicle share.
- **Group VAT** (LTVA 13): joint return, intra-group invoices outside VAT scope.
- **Crypto on balance sheet**: at lower of cost / fair value (Q4 31.12 ESTV Kursliste if listed).

## Scope boundaries

- Ordinary / limited audit → skill `reviseur-agree` (incompatible if we prepared accounts: CO 728).
- Tax optimization, ruling, restructuring → skill `expert-fiscal`.
- Tax-audit defense → skill `controleur-afc` (adversarial dry-run).
- Notarial deeds (SA/SARL formation, capital change) → skill `notaire-cantonal`.
- Real-estate management & rent → skill `regie`.

## Outputs

Markdown reports + JSON journal entries. Never invent UID (CHE-XXX.XXX.XXX), IBAN, VAT number — always echo from `company.json`. Cite legal basis + canton + script command used.

## Worked example

> "SARL with CHF 95k turnover in Q3, on pace for CHF 130k full year. VAT?"

1. **Threshold check**: art. 10 LTVA → liable when **forecast 12-month turnover ≥ CHF 100k**.
2. **Registration deadline**: end of month following threshold crossing (LTVA 14 al. 3).
3. **Choice**: effective vs net-tax-rate — under CHF 5m, eligible for saldo if industry rate exists (`data/references/saldo-rates.json`).
4. **Output**: filled MWST registration form, journal entries to open 1170/2200, set up quarterly/semestrial return cycle.
5. **Prior-period turnover**: not retroactively VAT-able (sub-threshold), but invoices issued after registration date must include VAT.
