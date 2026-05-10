# Year-end closing — 12-step workflow

Aligned with CO 957a–963b and Swiss SME COA.

## 1. Bank reconciliation
For every account in `company.json.banks`, reconcile the booked balance with the bank statement (PostFinance camt.053 / bexio / direct).

## 2. Cut-off
Identify transitory entries:
- **Active prepayments** (CCA — charges constatées d'avance / TRA)
- **Passive prepayments** (PCA / TPA)
- **Accrued income** (PRA)
- **Accrued expenses** (CRA)

Booking: `1300 Aktive Rechnungsabgrenzungen` / `2300 Passive RA`.

## 3. Inventory
Closing stock at lower of cost / market (CO 960c). LIFO not allowed for tax (FIFO or weighted average).

## 4. Depreciation
Apply usual rates per ESTV info "Abschreibungen auf Anlagevermögen":
- Buildings: 2 % straight-line / 4 % declining
- Equipment: 25 % straight-line / 40 % declining
- Vehicles: 20 % / 40 %
- IT: 40 % / 80 %

## 5. Provisions
Justify commercially per CO 960e:
- General debtor provision: 5 % CH / 10 % foreign (ESTV tolerance)
- Stock provision: max 1/3 of inventory (ESTV tolerance)
- Litigation / warranty / restructuring — case by case

## 6. VAT reconciliation
Annual reconciliation between accounted VAT and declared VAT (art. 72 LTVA). Difference filed by 31.08 N+1 via "Finalisation annuelle TVA".

## 7. Withholding tax (LIA)
If dividend distribution: form 103/110, 35 % withholding within 30 days of due date. Notification procedure (art. 20 LIA) possible for intra-group.

## 8. Salary certificates (Lohnausweis)
Issued by 31.01 N+1 to each employee. Withholding tax attestation if applicable.

## 9. AHV annual statement
Submitted to compensation fund by 30.01 N+1.

## 10. Annual accounts
- Balance sheet (Bilanz)
- P&L (Erfolgsrechnung)
- Annex (Anhang) per art. 959c CO — minimum 14 items for SMEs
- Cash flow statement if "large entity" (CO 961a: 2 of 3 criteria: assets ≥ 20m, turnover ≥ 40m, ≥ 250 FTE)

## 11. Audit (if applicable)
- Ordinary (CO 727) → SAS standards, full audit
- Limited (CO 727a) → SER standard, inquiries + analytical procedures
- Opting-out (≤ 10 FTE, all shareholders agree) → no audit

## 12. Tax filing
Cantonal tax return + IFD (federal). Deadlines per canton, usually 30.09 / 31.10 N+1 with possible extensions.

→ Hand off to `expert-fiscal` skill for the tax filing itself.
