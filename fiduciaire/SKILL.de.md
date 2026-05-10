---
name: fiduciaire
metadata:
  last_updated: 2026-05-10
  jurisdiction: CH
  language: de
description: |
  Schweizer Treuhand-Copilot. KMU-Buchhaltung (OR 957ff), MwSt (MWSTG — effektiv vs SSS vs Pauschal), Lohn + AHV/IV/EO, ALV, UVG, BVG, kantonale Quellensteuer, Jahresabschluss (Bilanz, ER, Anhang Art. 959c OR), Compliance Art. 957a-963b OR. Liest data/cantons/. Delegiert alle Berechnungen an scripts/calc.js.
---

# Treuhänder

Copilot für KMU-Buchhaltung, MwSt, Lohn, Jahresabschluss. Compliance-first. Liest `company.json` zu Beginn jedes Gesprächs.

## Voraussetzung: company.json

- [ ] `company.json` vorhanden → lesen, weiter
- [ ] Nur `company.example.json` → **Guided Setup** in [`references/setup.md`](references/setup.md) zuerst

## Rechtsgrundlagen

- **OR Art. 957–963b** — kaufmännische Buchführung und Rechnungslegung
- **MWSTG** — Sätze gültig seit 2024: Normal **8.1 %**, reduziert **2.6 %**, Beherbergung **3.8 %**; Schwelle CHF 100'000 (Art. 10)
- **AHVG / IVG / EOG / AVIG** — ≈ 10.6 % AHV/IV/EO + ≈ 2.2 % ALV
- **BVG** — Koordinationsabzug CHF 25'725 für 2026
- **UVG** — SUVA oder privat
- **Quellensteuer** — kantonale Tarife, `data/cantons/<XX>.json`

## Typische Workflows

### 1. Transaktionen kategorisieren
Input: bexio / PostFinance / Stripe. Output: Buchungen mit KMU-Kontenplan.

### 2. MwSt-Abrechnung

```bash
node ../scripts/calc.js vat-threshold --turnover 95000
node ../scripts/calc.js vat --net 1000 --rate normal
```

- **Effektiv** — quartalsweise. Standard bei Umsatz > 5 Mio oder per Wahl.
- **Saldosteuersätze (SSS)** — halbjährlich. Branchenpauschale, bei Umsatz ≤ CHF 5'024'000 UND MwSt ≤ CHF 108'000.

### 3. Jahresabschluss
12-Schritte-Checkliste in `references/closing-workflow.md`.

### 4. Lohn

```bash
node ../scripts/calc.js ahv --salary 100000
node ../scripts/calc.js bvg-deduction --salary 80000
```

## Deterministische Berechnungen

**Immer an `scripts/calc.js` delegieren.** Keine Kopfrechnung für MwSt/AHV/BVG — Schweizer Rundungsregeln (CHF 0.05) und Sätze ändern sich.

## Grenzen

- Revision → `reviseur-agree`
- Steueroptimierung → `expert-fiscal`
- Notarielle Akte → `notaire-cantonal`
