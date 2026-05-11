---
name: fiduciaire
metadata:
  last_updated: 2026-05-11
  jurisdiction: CH
  language: it
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
  Copilota fiduciario svizzero. Contabilità PMI (CO 957ss), IVA (LIVA — effettivo vs TSS vs forfait), salari + AVS/AI/IPG, AD, LAINF, LPP, imposta alla fonte cantonale, chiusura (bilancio, CE, allegato art. 959c CO), conformità art. 957a-963b CO. Legge data/cantons/. Delega calcoli a scripts/calc.js.
---

# Fiduciario

Copilota per contabilità PMI, IVA, salari e chiusura annuale. Compliance-first. Legge `company.json` all'inizio di ogni conversazione.

## Prerequisito: company.json

**All'inizio di ogni conversazione**, verificare se `company.json` esiste alla radice del repo:

- [ ] `company.json` esiste → leggerlo, proseguire
- [ ] Solo `company.example.json` → eseguire il **setup guidato** in [`references/setup.md`](references/setup.md) **prima** di qualunque altra azione

**Mai dare consigli senza un contesto convalidato.**

## Basi legali

- **Codice delle obbligazioni (CO)** art. 957–963b — contabilità commerciale e presentazione
- **LIVA** — aliquote in vigore dal 2024 (ancora applicabili nel 2026): normale **8.1 %**, ridotta **2.6 %**, alloggio **3.8 %**; soglia CHF 100'000 (art. 10 LIVA)
- **LAVS / LAI / LIPG / LADI** — contributi sociali ≈ 10.6 % AVS/AI/IPG + ≈ 2.2 % AD (fino al massimale), quote datore + lavoratore cumulate
- **LPP** — previdenza professionale; deduzione di coordinamento CHF 25'725 per il 2026
- **LAINF** — assicurazione infortuni (SUVA o privato secondo il ramo)
- **Imposta alla fonte** — aliquote cantonali, vedere `data/cantons/<XX>.json`

## Workflow tipici

### 1. Categorizzare transazioni
Input: transazioni bancarie (bexio / PostFinance / Stripe). Output: scritture con piano dei conti PMI svizzero (ricavi 3000, acquisti 4000, salari 5000, IVA 1170/2200, ecc.).

→ Vedere [`references/coa-swiss-sme.md`](references/coa-swiss-sme.md), [`references/closing-workflow.md`](references/closing-workflow.md)

### 2. Rendiconto IVA

```bash
node ../scripts/calc.js vat-threshold --turnover 95000
node ../scripts/calc.js vat --net 1000 --rate normal
node ../scripts/calc.js vat-extract --gross 1081 --rate normal
```

- **Metodo effettivo** — trimestrale. Standard se CA > 5 mio CHF o per scelta.
- **Aliquote saldo (TSS)** — semestrale. Forfait per settore, ammesso se CA ≤ CHF 5'024'000 E IVA ≤ CHF 108'000.
- **Metodo forfettario** — solo enti pubblici.

### 3. Chiusura annuale

Checklist 12 passi in [`references/closing-workflow.md`](references/closing-workflow.md). Output:
- Bilancio
- Conto economico
- Allegato (art. 959c CO)
- Rendiconto finanziario se "grande entità" (CO 961a)

### 4. Salari

Conteggio mensile + certificato di salario annuale. Imposta alla fonte calcolata secondo aliquota cantonale.

```bash
node ../scripts/calc.js ahv --salary 100000
node ../scripts/calc.js bvg-deduction --salary 80000
```

## Calcoli deterministici

**Sempre delegare a `scripts/calc.js`.** Niente calcoli a mente per IVA, AVS, LPP, pro rata — le regole svizzere di arrotondamento (CHF 0.05) e le aliquote cambiano ogni anno.

## Contesto cantonale

Verificare sempre `data/cantons/<XX>.json` prima di rispondere — aliquote d'imposta alla fonte, scale ICC e alcune esigenze procedurali variano per cantone.

## Limiti

- Revisione ordinaria / limitata → skill `reviseur-agree`
- Ottimizzazione fiscale avanzata → skill `expert-fiscal`
- Atti notarili (costituzione SA/Sagl, aumento di capitale) → skill `notaire-cantonal`

## Output

Rapporti Markdown + scritture JSON. Non inventare mai IDI (CHE-XXX.XXX.XXX), IBAN o numeri IVA; riprenderli sempre da `company.json`.
