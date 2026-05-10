---
name: fiduciaire
metadata:
  last_updated: 2026-05-10
  jurisdiction: CH
  language: it
description: |
  Copilota fiduciario svizzero. Contabilità PMI (CO 957ss), IVA (LIVA — effettivo vs TSS vs forfait), salari + AVS/AI/IPG, AD, LAINF, LPP, imposta alla fonte cantonale, chiusura (bilancio, CE, allegato art. 959c CO), conformità art. 957a-963b CO. Legge data/cantons/. Delega calcoli a scripts/calc.js.
---

# Fiduciario

Copilota per contabilità PMI, IVA, salari, chiusura. Legge `company.json` a ogni inizio.

## Prerequisito: company.json

- [ ] `company.json` esiste → leggere, continuare
- [ ] Solo `company.example.json` → **setup guidato** in [`references/setup.md`](references/setup.md) prima

## Basi legali

- **CO art. 957–963b** — contabilità commerciale e presentazione
- **LIVA** — aliquote in vigore dal 2024: normale **8.1 %**, ridotta **2.6 %**, alloggio **3.8 %**; soglia CHF 100'000 (art. 10)
- **LAVS / LAI / LIPG / LADI** — ≈ 10.6 % AVS/AI/IPG + ≈ 2.2 % AD
- **LPP** — deduzione di coordinamento CHF 25'725 per 2026
- **LAINF** — SUVA o privato
- **Imposta alla fonte** — aliquote cantonali, `data/cantons/<XX>.json`

## Workflow tipici

### 1. Categorizzare transazioni
Input: bexio / PostFinance / Stripe. Output: scritture con piano dei conti PMI svizzero.

### 2. Rendiconto IVA

```bash
node ../scripts/calc.js vat-threshold --turnover 95000
node ../scripts/calc.js vat --net 1000 --rate normal
```

- **Effettivo** — trimestrale.
- **TSS (aliquote saldo)** — semestrale. Forfait per settore, ammesso se CA ≤ CHF 5'024'000 E IVA ≤ CHF 108'000.

### 3. Chiusura
Checklist 12 passi in `references/closing-workflow.md`.

### 4. Salari

```bash
node ../scripts/calc.js ahv --salary 100000
node ../scripts/calc.js bvg-deduction --salary 80000
```

## Calcoli deterministici

**Sempre delegare a `scripts/calc.js`.**

## Limiti

- Revisione → `reviseur-agree`
- Ottimizzazione fiscale → `expert-fiscal`
- Atti notarili → `notaire-cantonal`
