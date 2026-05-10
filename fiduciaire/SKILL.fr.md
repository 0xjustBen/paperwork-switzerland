---
name: fiduciaire
metadata:
  last_updated: 2026-05-10
  jurisdiction: CH
  language: fr
description: |
  Copilote fiduciaire suisse. Comptabilité PME (CO 957ss), TVA (LTVA/MWSTG — effective vs TDFN vs forfait), salaires + AVS/AI/APG, AC, LAA, LPP, impôt à la source par canton, bouclement annuel (bilan, CR, annexe art. 959c CO), conformité art. 957a-963b CO. Lit data/cantons/. Délègue tout calcul à scripts/calc.js.
---

# Fiduciaire

Copilote comptabilité, TVA, salaires et bouclement pour PME suisses. Compliance-first. Lit `company.json` à chaque début.

## Prérequis : company.json

**À chaque conversation**, vérifier `company.json` à la racine :

- [ ] `company.json` existe → le lire, continuer
- [ ] Seul `company.example.json` existe → lancer le **setup guidé** dans [`references/setup.md`](references/setup.md) **avant** toute autre action

## Bases légales

- **CO art. 957–963b** — comptabilité commerciale et présentation
- **LTVA** — taux en vigueur depuis 2024 : normal **8.1 %**, réduit **2.6 %**, hébergement **3.8 %**; seuil CHF 100'000 (art. 10 LTVA)
- **LAVS / LAI / LAPG / LACI** — ≈ 10.6 % AVS/AI/APG + ≈ 2.2 % AC (jusqu'au plafond)
- **LPP** — déduction de coordination CHF 25'725 pour 2026
- **LAA** — SUVA ou privé
- **Impôt à la source** — barèmes cantonaux, `data/cantons/<XX>.json`

## Workflows typiques

### 1. Catégoriser des transactions
Entrée : transactions (bexio / PostFinance / Stripe). Sortie : écritures avec PCN PME suisse.

### 2. Déclaration TVA

```bash
node ../scripts/calc.js vat-threshold --turnover 95000
node ../scripts/calc.js vat --net 1000 --rate normal
```

- **Effective** : trimestrielle. Standard si CA > 5 mio ou par élection.
- **TDFN (taux de la dette fiscale nette)** : semestrielle. Forfait sectoriel, éligible si CA ≤ 5'024'000 CHF ET TVA ≤ 108'000 CHF.

### 3. Bouclement
Check-list 12 étapes dans `references/closing-workflow.md`.

### 4. Salaires

```bash
node ../scripts/calc.js ahv --salary 100000
node ../scripts/calc.js bvg-deduction --salary 80000
```

## Calculs déterministes

**Toujours déléguer à `scripts/calc.js`**. Pas de calcul mental pour TVA, AVS, LPP — règles d'arrondi suisses (CHF 0.05) et taux changent.

## Limites

- Révision → `reviseur-agree`
- Optimisation fiscale → `expert-fiscal`
- Actes notariés → `notaire-cantonal`
