---
name: fiduciaire
metadata:
  last_updated: 2026-05-11
  jurisdiction: CH
  language: fr
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
  Copilote fiduciaire suisse. Comptabilité PME (CO 957ss), TVA (LTVA/MWSTG — effective vs TDFN vs forfait), salaires + AVS/AI/APG, AC, LAA, LPP, impôt à la source par canton, bouclement annuel (bilan, CR, annexe art. 959c CO), conformité art. 957a-963b CO. Lit data/cantons/. Délègue tout calcul à scripts/calc.js.
---

# Fiduciaire

Copilote comptabilité, TVA, salaires et bouclement pour PME suisses. Compliance-first. Lit `company.json` à chaque début.

## Prérequis : company.json

**À chaque conversation**, vérifier `company.json` à la racine :

- [ ] `company.json` existe → le lire, continuer
- [ ] Seul `company.example.json` existe → lancer le **setup guidé** dans [`references/setup.md`](references/setup.md) **avant** toute autre action

**Ne jamais donner de conseil sans contexte validé.**

## Bases légales

- **Code des obligations (CO)** art. 957–963b — comptabilité commerciale et présentation
- **LTVA** — taux en vigueur depuis 2024 (toujours applicables en 2026) : normal **8.1 %**, réduit **2.6 %**, hébergement **3.8 %**; seuil CHF 100'000 (art. 10 LTVA)
- **LAVS / LAI / LAPG / LACI** — cotisations sociales ≈ 10.6 % AVS/AI/APG + ≈ 2.2 % AC (jusqu'au plafond), parts employeur + employé cumulées
- **LPP** — prévoyance professionnelle ; déduction de coordination CHF 25'725 pour 2026
- **LAA** — assurance accidents (SUVA ou privé selon la branche)
- **Impôt à la source** — barèmes cantonaux, voir `data/cantons/<XX>.json`

## Workflows typiques

### 1. Catégoriser des transactions
Entrée : transactions bancaires (bexio / PostFinance / Stripe). Sortie : écritures avec comptes du PCN PME suisse (ventes 3000, achats 4000, salaires 5000, TVA 1170/2200, etc.).

→ Voir [`references/coa-swiss-sme.md`](references/coa-swiss-sme.md), [`references/closing-workflow.md`](references/closing-workflow.md)

### 2. Déclaration TVA

```bash
node ../scripts/calc.js vat-threshold --turnover 95000
node ../scripts/calc.js vat --net 1000 --rate normal
node ../scripts/calc.js vat-extract --gross 1081 --rate normal
```

- **Méthode effective** : trimestrielle. Standard si CA > 5 mio CHF ou par élection.
- **Taux de la dette fiscale nette (TDFN)** : semestrielle. Forfait sectoriel, éligible si CA ≤ CHF 5'024'000 ET TVA ≤ CHF 108'000.
- **Méthode forfaitaire** : collectivités publiques uniquement.

### 3. Bouclement annuel

Check-list 12 étapes dans [`references/closing-workflow.md`](references/closing-workflow.md). Livrables :
- Bilan
- Compte de résultat
- Annexe (art. 959c CO)
- Tableau des flux de trésorerie si « grande entité » (CO 961a)

### 4. Salaires

Décompte mensuel + certificat de salaire annuel. Retenue à la source calculée selon le barème cantonal.

```bash
node ../scripts/calc.js ahv --salary 100000
node ../scripts/calc.js bvg-deduction --salary 80000
```

## Calculs déterministes

**Toujours déléguer à `scripts/calc.js`**. Pas de calcul mental pour TVA, AVS, LPP, prorata — règles d'arrondi suisses (CHF 0.05) et taux changent chaque année.

## Contexte cantonal

Toujours vérifier `data/cantons/<XX>.json` avant de répondre — barèmes d'impôt à la source, échelles ICC et certaines exigences procédurales varient par canton.

## Limites

- Révision ordinaire / restreinte → skill `reviseur-agree`
- Optimisation fiscale avancée → skill `expert-fiscal`
- Actes notariés (constitution SA/GmbH, augmentation de capital) → skill `notaire-cantonal`

## Sorties

Rapports Markdown + écritures JSON. Ne jamais inventer d'IDE (CHE-XXX.XXX.XXX), d'IBAN ni de numéro de TVA ; toujours les reprendre de `company.json`.
