# Guided setup

Run this **before any other action** if `company.json` is missing.

## Questions to ask

1. **Legal form**: SA / GmbH (Sàrl) / Einzelfirma (raison individuelle) / Verein / Stiftung / Genossenschaft
2. **Canton & commune** (chef-lieu? or another commune?)
3. **UID** (`CHE-XXX.XXX.XXX`, from [zefix.ch](https://www.zefix.ch))
4. **VAT subjectivity** — turnover ≥ CHF 100,000 (art. 10 LTVA)?
5. **VAT method** — effective, net tax debt rate (NTDR / TDFN), or flat rate?
6. **VAT frequency** — quarterly (effective) or semestrial (NTDR)?
7. **Fiscal year** — calendar (1.1 → 31.12) or shifted?
8. **AHV caisse** — which compensation fund (Ausgleichskasse / caisse AVS)?
9. **BVG provider** — Swiss Life / AXA / Bâloise / Vita / collective foundation?
10. **UVG provider** — SUVA (mandatory for industrial branches) or private?
11. **Audit regime** — ordinary (CO 727), limited (CO 727a), or opting-out (≤ 10 FTE)?
12. **Bank** — IBAN, currency, integration enabled (bexio / PostFinance ISO 20022)?
13. **Stripe accounts** — single, multiple separate, or Stripe Connect?

## Output

Write the answers to `company.json` (gitignored), matching the schema of `company.example.json`. Then proceed.

## Validation

- UID format: `^CHE-\d{3}\.\d{3}\.\d{3}$`
- IBAN format: validate via mod-97 check (use `node ../scripts/calc.js iban-check --iban CH…` once implemented)
- Canton: must be one of the 26 codes in `data/cantons/`
