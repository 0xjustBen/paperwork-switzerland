# Cantonal data

One JSON per canton (26 files), keyed by ISO 3166-2:CH code.

Schema: [`_schema.json`](./_schema.json).

## ⚠️ Indicative data

The tax rates, transfer duties, and succession rules here are **indicative**, based on aggregated public sources (KPMG / PwC / ESTV — reference data 2024-2025, to be refreshed). **Contributors are encouraged to verify and update them against their canton's official publications.** For any binding decision, consult the cantonal tax administration (URL included in each file).

## Update procedure

1. Edit `<XX>.json`
2. Add an entry under `sources` with the URL and `consulte_le` date
3. Open a PR — a maintainer familiar with the canton should review

## Priority fields to enrich

- Cantonal individual income tax scales (barème ICC)
- Withholding tax tables per category
- Local specifics (forfait fiscal, tax shield, …)
- Official forms and filing deadlines
