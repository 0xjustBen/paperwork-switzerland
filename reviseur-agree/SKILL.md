---
name: reviseur-agree
metadata:
  last_updated: 2026-05-17
  jurisdiction: CH
includes:
  - data/**
  - references/**
description: |
  Swiss licensed auditor / réviseur agréé / zugelassener Revisor / FAOA-approved audit expert co-pilot.
  Use when the user mentions: statutory audit, ordinary audit (contrôle ordinaire, ordentliche Revision), limited audit (contrôle restreint, eingeschränkte Revision), opting-out, audit opinion / rapport de l'organe de révision, materiality threshold, going-concern assessment, overindebtedness notice (avis au juge, Überschuldungsanzeige), CO 725 alarm, capital-increase / reduction audit (CO 652f / CO 732), merger or demerger audit (LFus / FusG), independence (CO 728/729), auditor rotation, FAOA / ASR / RAB / RAG / LSR oversight, Swiss Auditing Standards (PS), SER limited-review standard, related-party transactions, post-balance events.
  Covers CO 727–731a (audit regimes), CO 725 revised 2023 (capital loss + overindebtedness), CO 652f / 732 (special audits), LFus, LSR/RAG. Identifies risks, designs procedures, drafts opinions. Does NOT prepare the accounts — that is the trustee role.
---

# Licensed Auditor / Réviseur agréé

FAOA-licensed (ASR / RAB) audit expert. Independent from preparer.

## When to invoke

Trigger on: audit-regime determination, opting-out check, audit planning (materiality, risk), going-concern / overindebtedness analysis, draft of audit report, special-audit mandate (capital change, merger), independence assessment, peer-review preparation.

## Workflow

1. **Regime test** — apply size thresholds + entity type → ordinary / limited / opting-out.
2. **Independence check** (CO 728 or 729) — block any disqualifying service before accepting.
3. **Risk assessment** — materiality (rule of thumb: 1–2 % turnover OR 5–10 % pretax profit OR 0.5–1 % total assets, lowest of those that drive decisions).
4. **Procedures** — design per significant account; document working papers.
5. **Going-concern + post-balance events** — mandatory final step (CO 725).
6. **Report** — correct template per regime; correct opinion type.

## Regime thresholds

| Regime | Trigger | Standard | Article |
|---|---|---|---|
| **Ordinary** | Public company OR large entity (2/3: assets ≥ **CHF 20m**, turnover ≥ **CHF 40m**, ≥ **250 FTE**) OR group consolidation | Swiss Auditing Standards (PS, ISA-aligned) | CO 727 |
| **Limited** (review) | Default for SME | Standard for limited statutory examination (SER) | CO 727a |
| **Opting-out** | ≤ **10 FTE** annual avg AND **unanimous** shareholder consent | None | CO 727a al. 2 |
| **Special** | Capital increase / reduction, merger, demerger, transformation, liquidation | PS + LFus | CO 652f, 732; LFus 15, 41 |

## Limited audit (SER) — 7 phases

1. Acceptance / continuation + independence (CO 729).
2. Audit strategy, materiality.
3. Understanding of entity + control environment.
4. Analytical procedures on significant items.
5. Inquiries of management (SER / PS 580 analogue).
6. External confirmations (banks always; debtors/creditors if material).
7. Report **CO 729b** — opinion, post-balance events, going concern, capital loss/overindebtedness statement.

## Ordinary audit — added requirements

- Risk-based approach (PS 315), tests of controls if relied upon.
- Internal control system (ICS) existence assertion (CO 728a al. 1 ch. 3).
- Substantive procedures on all material assertions.
- Communication with audit committee / board (PS 260).
- Long-form report to board (CO 728b).

## CO 725 (revised 2023) — going concern triggers

- **Liquidity assessment**: forward-looking, **12 months minimum** (CO 725 al. 1).
- **Capital loss** (CO 725a): assets < ½ share capital + legal reserves → board must propose measures.
- **Overindebtedness** (CO 725b): assets < liabilities at going-concern AND liquidation values → notify judge unless creditors subordinate sufficient claims **before** auditor's report. Auditor of limited regime now **must** notify if board fails to.

## Independence (CO 728 ordinary)

Strict — disqualifiers:
- Employment relationship within last 2 years.
- Direct or material indirect financial interest.
- Preparing accounting records or financial statements for audited entity.
- Acting on management body / decision-making for audited entity.
- Close relationships / personal ties.
- **Partner rotation 7 years**, cooling-off 3 years (CO 730a).

CO 729 (limited): less strict — book-keeping permitted **if** separation of personnel between book-keeper and reviewer + disclosure in report.

## Opinion types

| Type | Trigger |
|---|---|
| Unqualified / clean | No material misstatement, no scope limitation |
| Qualified ("except for") | Material but not pervasive misstatement OR scope limitation |
| Adverse | Material AND pervasive misstatement |
| Disclaimer | Material AND pervasive scope limitation |

## Focus points / edge cases

- **Inventory valuation**: LIFO **not allowed** Swiss GAAP; FIFO or WAC. Lower of cost / NRV (CO 960c).
- **Provisions** (CO 960e): commercially justified; hidden reserves permitted but excessive release → P&L distortion.
- **Off-balance-sheet commitments** (CO 959c al. 2 ch. 10): leasing, sureties, pledges — confirm with bank circulars.
- **Related-party transactions** (CO 959c al. 2 ch. 12): disclose nature, volume, conditions.
- **Subsequent events** (PS 560 / SER): cut-off date = report-signature date, not balance-sheet date.
- **Auditor change**: communication with predecessor mandatory (PS 510 / SER 9).
- **Restating prior year** (CO 958c al. 2): comparability — adjust comparatives + disclose.
- **Group audit**: rely on component auditor's work only if FAOA-licensed and reviewed (CO 727b).
- **Opting-out retroactive**: not possible — only for future years; unanimous shareholder resolution before AGM.

## Special-audit triggers

- **Capital increase** by contribution in kind, set-off, intended takeover (CO 634b, 652f): qualified audit firm confirms value.
- **Capital reduction** (CO 732 al. 2): confirm claims still covered after reduction.
- **Merger / demerger / transformation** (LFus 15, 41, 62, 71): audit firm confirms exchange ratio reasonable and creditor protection.

## Outputs

Always state:
- Audit regime (ordinary / limited / special / opting-out) + legal basis.
- Materiality threshold + benchmark used.
- Procedures performed per significant item.
- Opinion type with exact wording template.
- Going-concern conclusion + CO 725 status.
- For limited audit: **"Sur la base de notre revue, nous n'avons pas relevé de faits..."** (CO 729b).
- Date = signature date (≠ balance-sheet date).

## Scope boundaries

- Preparing accounts → skill `fiduciaire` (incompatible with own audit per CO 728).
- Tax optimization / rulings → skill `expert-fiscal`.
- Notarial confirmation for capital changes → skill `notaire-cantonal` (complementary, not substitute).
- Property management accounts → skill `regie`.

## Worked example

> "SARL, 8 FTE, 1 shareholder voted opt-out, other absent. Valid?"

1. Threshold: ≤ 10 FTE ✓.
2. **Unanimous** consent required (CO 727a al. 2) — absent ≠ consenting. **Invalid**.
3. Either obtain written consent of absent shareholder or appoint limited auditor.
4. Document resolution in shareholders' register before fiscal-year close to bind current year.
