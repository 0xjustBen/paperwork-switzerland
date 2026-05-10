# Swiss SME chart of accounts (KMU-Kontenplan)

Standard chart used by most Swiss SMEs. Based on the veb.ch / treuhand-suisse model, aligned with CO 957a requirements.

## Major classes

| Class | Range | Description |
|-------|-------|-------------|
| 1 | 1000–1999 | Assets (Aktiven) |
| 2 | 2000–2999 | Liabilities + equity (Passiven) |
| 3 | 3000–3999 | Revenue (Ertrag) |
| 4 | 4000–4999 | Materials / goods (Material- und Warenaufwand) |
| 5 | 5000–5999 | Personnel (Personalaufwand) |
| 6 | 6000–6999 | Other operating expenses (übriger Betriebsaufwand) |
| 7 | 7000–7999 | Other operating result (übriger Betriebserfolg) |
| 8 | 8000–8999 | Extraordinary / non-operating (a. o. + neutral) |
| 9 | 9000–9999 | Closing / off-balance-sheet |

## Frequent accounts (extract)

| Account | Name |
|---------|------|
| 1000 | Cash |
| 1020 | Bank — current (CHF) |
| 1100 | Trade receivables (Debitoren) CH |
| 1109 | Provision for doubtful debts |
| 1170 | Input VAT (Vorsteuer) on goods |
| 1171 | Input VAT on services / investments |
| 1200 | Inventory |
| 1500 | Equipment |
| 1509 | Accumulated depreciation — equipment |
| 1700 | Vehicles |
| 1709 | Accumulated depreciation — vehicles |
| 2000 | Trade payables (Kreditoren) |
| 2200 | Output VAT (Umsatzsteuer) |
| 2270 | VAT account / clearing |
| 2300 | Passive accruals (TPA / PCA) |
| 2800 | Capital (capital-actions / Aktienkapital) |
| 2970 | Retained earnings |
| 3000 | Revenue from sales / services |
| 3200 | Revenue from goods sold |
| 3800 | Revenue reductions / discounts |
| 4000 | Goods / materials |
| 5000 | Gross salaries |
| 5700 | AHV / IV / EO / ALV employer share |
| 5710 | BVG employer share |
| 5730 | UVG / SUVA |
| 6000 | Rent (Miete) |
| 6100 | Maintenance of equipment |
| 6200 | Vehicle expenses |
| 6500 | Office supplies |
| 6900 | Other operating expenses |
| 7000 | Income from securities |
| 7100 | Interest income |
| 7510 | Interest expense (bank) |
| 8500 | Extraordinary income |
| 8510 | Extraordinary expense |
| 8900 | Direct taxes (provision) |

## Booking conventions

- VAT entries: split 8.1 % (most cases) / 2.6 % (food, books, medicines) / 3.8 % (lodging) / 0 % (export, financial services)
- Effective method: book VAT separately at each transaction
- NTDR method: book transactions inclusive of VAT, periodic adjustment via the saldosteuersatz
- Foreign currency: convert at daily rate (ESTV tolerance: monthly average)

## References

- veb.ch / TreuhandSuisse — Swiss SME COA reference
- CO art. 957a — minimum bookkeeping requirements
- ESTV info MWST — VAT booking rules
