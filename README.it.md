<sub>🌐 [English](./README.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · **Italiano**</sub>

![paperwork-switzerland](./assets/banner.svg)

<h1 align="center">Paperwork Switzerland 🇨🇭</h1>

<p align="center">
  <b>Skill per agenti IA specializzati nella burocrazia svizzera — tutti i 26 cantoni.</b>
</p>

<p align="center">
  <i>Perché qualcuno doveva sbrigare le scartoffie, e quel qualcuno non ha bisogno di pause caffè.</i>
</p>

Ispirato a [`romainsimon/paperasse`](https://github.com/romainsimon/paperasse) (FR) — stessa struttura, contenuto svizzero: tre livelli d'imposta (Confederazione, cantoni, comuni), quattro lingue ufficiali, 26 regimi cantonali.

---

## Cos'è?

**Paperwork Switzerland è una raccolta di skill per agenti IA** ([Claude Code](https://claude.com/product/claude-code), [Codex](https://openai.com/codex/), [Cursor](https://cursor.com), [Windsurf](https://windsurf.com), [Cline](https://cline.bot), [Aider](https://aider.chat)) specializzati in contabilità, fiscalità, revisione, notariato e amministrazione immobiliare svizzeri.

Ogni skill trasforma il tuo agente in un copilota esperto: contabilità (CO 957ss, piano dei conti PMI, IVA, chiusura), fiscalità federale e cantonale (LIFD, 26 regimi, imposta alla fonte, frontalieri), controllo AFC, revisione (CO 727 / 727a, ASR), notariato cantonale (latino / libero / misto), amministrazione immobiliare (CO 253ss, PPP).

Le skill sono Markdown. Il repo include anche connettori bancari (**bexio**, **PostFinance** via ISO 20022) e pagamenti (**Stripe**), generazione QR-fattura svizzera, e calcolatori deterministici per IVA, IFD e imposta cantonale PG.

---

## Installazione rapida

### Opzione 1 — L'agente installa

```
Installa tutte le skill da https://github.com/0xjustBen/paperwork-switzerland
Poi lancia il setup per gestire la mia burocrazia svizzera
```

### Opzione 2 — Manuale

```bash
git clone https://github.com/0xjustBen/paperwork-switzerland.git
cd paperwork-switzerland
cp -r fiduciaire expert-fiscal controleur-afc reviseur-agree notaire-cantonal regie ~/.claude/skills/
npm install
uv sync --project evals
```

---

## Le 6 skill

| Skill | Ruolo | Cosa fa |
|-------|-------|---------|
| **`fiduciaire`** | Fiduciario | Contabilità PMI, IVA (8.1/2.6/3.8 %), salari + AVS/LPP, chiusura (CO 957ss) |
| **`expert-fiscal`** | Esperto fiscale | PF & PG, IFD + 26 ICC, sostanza, valore locativo, 3a, frontalieri |
| **`controleur-afc`** | Controllore AFC | Simulazione controllo AFC/cantonale su 6 assi |
| **`reviseur-agree`** | Revisore abilitato | Ordinaria (CO 727) / limitata (CO 727a), norme ASR, CO 725 |
| **`notaire-cantonal`** | Notaio cantonale | Sistema notarile per cantone — immobiliare, successioni, società |
| **`regie`** | Amministratore | Locazione (CO 253–274g), PPP (CC 712a ss), tasso di riferimento UFAB |

4 lingue per skill: `SKILL.md` (inglese, predefinito), `SKILL.fr.md`, `SKILL.de.md`, `SKILL.it.md`.

---

## Esempi

```
> Ecco le mie transazioni bexio Q4. Categorizzale e genera le scritture.
> Chiusura della mia SA zurighese per il 2026.
> Confronto carico fiscale PG ZG vs GE per CHF 500'000 di utile.
> Sono frontaliere italiano a Lugano. Imposta alla fonte?
> Modulo ufficiale di aumento pigione a Lugano, tasso di riferimento UFAB al 1.75 %.
> Acquisto chalet a Verbier. Spese notarili e tasse di mutazione in Vallese?
```

---

## Dati cantonali

[`data/cantons/`](./data/cantons) — un JSON per cantone, schema in [`_schema.json`](./data/cantons/_schema.json).

## Calcolatori deterministici

```bash
node scripts/calc.js vat --net 1000 --rate normal
node scripts/calc.js ifd --profit 500000
node scripts/calc.js pm --canton TI --profit 500000
```

## Integrazioni

| Connettore | Descrizione | Env |
|-----------|-------------|-----|
| [bexio](integrations/bexio) | Contabilità PMI svizzera | `BEXIO_API_TOKEN` |
| [Stripe](integrations/stripe) | Pagamenti | `STRIPE_SECRET` |
| [PostFinance](integrations/postfinance) | Parser ISO 20022 camt.053 | — |

## Valutazioni

Framework LLM-as-judge sul modello di `romainsimon/paperasse`. Casi per skill in `<skill>/evals/evals.json`.

```bash
uv run --project evals python evals/run_evals.py
```

---

## ⚠️ Avvertenza

Strumenti di assistenza. Non sostituiscono fiduciario, esperto fiscale, revisore ASR, notaio o avvocato abilitati. Verificare con fonti ufficiali (AFC, BAZG, cantoni).

## Fonti

- [AFC](https://www.estv.admin.ch) · [Fedlex](https://www.fedlex.admin.ch) · [CSI](https://www.steuerkonferenz.ch) · [ASR](https://www.rab-asr.ch) · [FSN](https://www.notaires.ch) · [UFAB — tasso di riferimento](https://www.bwo.admin.ch)
