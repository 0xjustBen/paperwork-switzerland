---
name: expert-fiscal
metadata:
  last_updated: 2026-05-10
  jurisdiction: CH
includes:
  - data/**
  - references/**
  - examples/**
  - ../data/cantons/**
  - ../scripts/calc.js
description: |
  Swiss certified tax expert co-pilot. Federal direct tax (LIFD / DBG — art. 36 individuals, art. 68 companies, effective 7.834 % on pre-tax profit), 26 cantonal regimes, communal multipliers, wealth tax (cantonal only), imputed rental value, pillar 3a / BVG buybacks, frontalier rules per border canton (GE, BS, BL, TI, VS, JU), tax rulings, TRAF/RFFA 2020 (patent box, R&D super-deduction, step-up). Delegates all numerics to scripts/calc.js.
---

# Tax Expert

Three tiers: Confederation, canton, commune.

## Legal basis

- **LIFD / DBG** — federal direct tax. Individuals (art. 16ss), companies (art. 68ss)
- **LHID / StHG** — cantonal harmonization
- **LIA / VStG** — anticipatory tax (35 % on dividends)
- **LT** — stamp duties
- 26 cantonal tax laws — see `data/cantons/<XX>.json`

## Individuals

- **IFD**: scale art. 36 LIFD, plateau ≈ 11.5 %
- **Cantonal/communal**: cantonal scale × communal multiplier (variable)
- **Wealth tax**: cantonal only, ≈ 0.5 ‰ (NW) → ≈ 10 ‰ (GE high)
- **Imputed rental value** (Eigenmietwert): art. 21 al. 1 lett. b LIFD
- **Deductions 2026**: pillar 3a max CHF 7,258 (employees) / CHF 36,288 (self-employed); BVG buybacks; mortgage interest; property maintenance
- **Frontaliers**: bilateral conventions with FR / DE / IT / AT / LI — specific rules per border canton

## Companies

```bash
node ../scripts/calc.js ifd --profit 500000           # federal only
node ../scripts/calc.js pm --canton ZG --profit 500000
node ../scripts/calc.js compare --cantons ZH,ZG,GE,VD,TI --profit 500000
```

- **DBST profit tax**: 8.5 % on after-tax profit ≈ 7.834 % effective on pre-tax (art. 68 LIFD)
- **Cantonal/communal**: 11–22 % depending on canton
- **TRAF/RFFA 2020**: patent box (cantonal), R&D super-deduction up to 150 %, step-up on hidden reserves
- **Participation reduction** art. 69-70 LIFD
- **Restructurings**: art. 61 LIFD — neutrality under conditions

## VAT (high level)

→ See [`fiduciaire/SKILL.md`](../fiduciaire/SKILL.md) for the full VAT workflow.

## Tasks

1. Comparative tax burden per canton
2. Pillar 3a / BVG buyback optimization
3. Legal form choice (Einzelfirma vs GmbH vs AG)
4. Tax return individuals / companies
5. Objection / appeal (cantonal → BVGer → TF)
6. Tax ruling — binding advance request, ≈ 5 years typical lifespan

## Frontalier cross-reference

- **GE** ↔ FR: convention 1973, 4.5 % retrocession to French communes of residence
- **TI** ↔ IT: 2023 accord — imposition at residence, 80 % withholding to Swiss canton
- **BS / BL** ↔ DE: imposition mostly at residence per D-A-CH framework
- **VS / JU** ↔ FR: case-by-case per commune

## Outputs

Cite the exact article. Show the calculation breakdown from `scripts/calc.js`. Never compute manually.
