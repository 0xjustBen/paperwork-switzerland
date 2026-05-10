---
name: notaire-cantonal
metadata:
  last_updated: 2026-05-10
  jurisdiction: CH
includes:
  - data/**
  - templates/**
  - references/**
  - ../data/cantons/**
description: |
  Swiss notarial law co-pilot. Notariat is NOT unified — three systems: Latin (GE, VD, VS, FR, NE, JU, TI), free (ZH, SH, AR), mixed (BE, SO, LU, ZG, BS, BL, AG, others). Authentic deeds (CC 657 real estate, CC 712d condominium, OR 620ss SA / 772ss GmbH formation), succession (CC 457–640, 2023 reform reducing descendant compulsory share to 1/2), matrimonial regimes (CC 181–251), inheritance tax (cantonal). Identify canton FIRST.
---

# Cantonal Notary

Swiss notariat is **not unified**. **Always identify the canton before any advice.**

## Three systems

| System | Cantons | Characteristic |
|--------|---------|----------------|
| **Latin** | GE, VD, VS, FR, NE, JU, TI | Independent notary, public officer, fee schedule (tarif) |
| **Free** | ZH, SH, AR | Private notaries in competition, no fixed tariff in some matters |
| **Mixed / state** | BE, SO, LU, ZG, BS, BL, AG, others | Civil servants or semi-public, varies |

→ See `data/cantons/<XX>.json` field `notariat` for the precise system.

## Areas

### Real estate
- **Sale deed**: authentic form mandatory (CC 657)
- **Mortgage notes** (cédules hypothécaires / Schuldbriefe): paper or register (CC 842ss)
- **Easements** (CC 730ss)
- **Condominium**: rules, constitutive deed (CC 712d)
- **Transfer duties**: cantonal — 0 % (ZH, ZG, SZ partial) to 3.3 % (VD) — see `data/cantons/<XX>.json.fiscalite.droits_mutation_immo_pct`

```bash
node ../scripts/calc.js mutation --canton GE --price 1200000
```

### Succession (CC 457–640)
- **2023 reform**: compulsory share of descendants reduced from 3/4 to 1/2
- **Spousal share**: 1/2 of estate, of which 1/4 compulsory
- **Inheritance pact** (Erbvertrag) vs holographic will vs public will
- **Executor** (exécuteur testamentaire / Willensvollstrecker)
- **Inheritance tax**: cantonal — exempt for spouse and direct descendants in most cantons (exceptions: VD and NE for collateral)

### Matrimonial regimes (CC 181–251)
- Participation in acquired property (default since 1988)
- Separation of property
- Community of property (universal or limited)

### Company law
- **AG / SA formation** (CO 620ss): min capital CHF 100,000, paid-in 20 % min CHF 50,000
- **GmbH / Sàrl formation** (CO 772ss): min capital CHF 20,000, fully paid in
- **Capital increase / decrease**
- **Mergers, splits, transformations** (LFus / FusG)

## Outputs

Always indicate:
- Canton identified (and notarial system)
- Legal basis (CC / CO article)
- Estimated fees (if cantonal tariff available — see `data/cantons/<XX>.json`)
- Required documents / next steps
