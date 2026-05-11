<sub>🌐 [English](./README.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · **Italiano**</sub>

![paperwork-switzerland](./assets/banner.svg)

![demo](./assets/demo.svg)

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

## Utilizzo con agenti IA

Le skill sono semplice Markdown — qualunque agente in grado di leggere file
può usarle. Il repo è strutturato in modo che ogni directory di skill
(`fiduciaire/`, `expert-fiscal/`, …) possa essere caricata direttamente come
prompt di sistema.

### Claude Code

```bash
cp -r fiduciaire expert-fiscal controleur-afc reviseur-agree notaire-cantonal regie ~/.claude/skills/
```
Claude Code rileva automaticamente `~/.claude/skills/*/SKILL.md` e indirizza
le invocazioni in base alla descrizione della skill. Imposta
`CLAUDE_PROJECT_DIR` su questo repo per mantenere `data/cantons/` e
`scripts/calc.js` nel perimetro.

### Codex / OpenAI

Codex CLI legge da `~/.codex/instructions.md`. Aggiungi lì il contenuto della
`SKILL.md` pertinente, oppure passalo via `--system` all'API. Per l'API,
imposta `OPENAI_API_KEY` e usa `gpt-4o-mini` o superiore; fissa il testo
della skill come primo messaggio `system` di ogni richiesta.

### Cursor

Apri il repo in Cursor e aggiungi il file della skill desiderato in **Cursor
Settings → Rules → Project Rules** (accetta direttamente file Markdown). In
alternativa, metti `SKILL.md` come `.cursorrules` alla radice del repo per
un contesto globale.

### Mistral via Le Chat / Codestral

In Le Chat, allega la `SKILL.md` pertinente come file di conoscenza (i piani
a pagamento supportano istruzioni persistenti). Per Codestral o l'API
Mistral diretta, imposta `MISTRAL_API_KEY` e anteponi `SKILL.md` come
messaggio `system` — `mistral-small-latest` basta nella maggior parte dei
casi; `mistral-large-latest` per domande cantonali ambigue.

### Aider

```bash
aider --read fiduciaire/SKILL.md --read data/cantons/ZH.json
```
Usa `--read` per un contesto in sola lettura; Aider mantiene la skill
caricata per tutta la sessione.

### Cline

In VS Code, aggiungi i percorsi delle skill sotto **Cline → Settings →
Custom Instructions**, oppure punta Cline sul repo e chiedigli di "leggere
fiduciaire/SKILL.md e seguirlo". Cline conserva le istruzioni personalizzate
per workspace.

### Windsurf

Metti il testo della skill in `.windsurfrules` alla radice del repo
(Windsurf lo legge a ogni conversazione). Per configurazioni multi-skill,
concatena i `SKILL.md` pertinenti.

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

[`data/cantons/`](./data/cantons) — un JSON per cantone (codice ISO 3166-2), schema in [`_schema.json`](./data/cantons/_schema.json). Usato da tutte le skill e dai calcolatori deterministici.

Campi: nome ufficiale (multilingue), capoluogo, lingue, URL dell'amministrazione fiscale cantonale, sistema notarile, aliquote effettive indicative, tasse di mutazione, specificità cantonali.

---

## Calcolatori deterministici

Gli LLM sono pessimi in aritmetica. Le skill delegano ogni calcolo a `scripts/calc.js`:

```bash
# IVA (in vigore dal 2024)
node scripts/calc.js vat --net 1000 --rate normal       # → 81.00
node scripts/calc.js vat-extract --gross 1081 --rate normal

# Imposta federale diretta (IFD)
node scripts/calc.js ifd --profit 500000                 # → 39 170.51 CHF

# Stima imposta PG combinata
node scripts/calc.js pm --canton TI --profit 500000      # → ... CHF
node scripts/calc.js compare --cantons ZH,ZG,GE,VD,TI --profit 500000

# Soglia art. 10 LIVA
node scripts/calc.js vat-threshold --turnover 95000      # → non assoggettato

# Tassa di mutazione immobiliare
node scripts/calc.js mutation --canton GE --price 1200000

# Pro rata, contributi AVS, deduzione di coordinamento LPP…
node scripts/calc.js --help
```

Output JSON, pronto per essere reimmesso nelle skill.

---

## Integrazioni

| Connettore | Descrizione | Env |
|-----------|-------------|-----|
| [bexio](integrations/bexio) | Contabilità PMI svizzera, transazioni, contatti | `BEXIO_API_TOKEN` |
| [Stripe](integrations/stripe) | Charges, payouts, commissioni (CHF / EUR / USD) | `STRIPE_SECRET` |
| [PostFinance](integrations/postfinance) | Parser ISO 20022 camt.053 (offline) | — |

```bash
npm run fetch:bexio
npm run fetch:stripe -- --start 2026-01-01
node integrations/postfinance/parse.js statement.xml > transactions.json
```

Vedere [`integrations/README.md`](./integrations/README.md) e [`.env.example`](./.env.example).

---

## Valutazioni

Framework LLM-as-judge sul modello di `romainsimon/paperasse`. Le skill vengono eseguite con e senza il loro SKILL.md, poi valutate su accuratezza, citazione delle basi legali corrette (CO / LIFD / LIVA / CC) e assenza di riferimenti franco-specifici (CGI, DGFIP, BOFiP).

```bash
uv run --project evals python evals/run_evals.py
```

---

## Metodologia di valutazione

Due modalità, stesso harness (`evals/run_evals.py`):

- **Modalità stub** (default, offline) — le uscite sono valutate per
  corrispondenza di sottostringa contro `expected_themes` / `must_cite` /
  `must_not_cite`. Veloce, deterministico, nessuna chiave API richiesta.
  Ideale per CI su PR di prompt/dati. Risultati in `evals/runs/`.
- **Modalità live** (`--mode=live --provider={anthropic,openai,mistral}`) —
  vero LLM-as-judge: ogni caso viene eseguito due volte (con e senza la
  skill caricata come prompt di sistema), poi una seconda chiamata allo
  stesso provider assegna 0–100 secondo la rubrica. Risultati in
  `evals/results/<provider>-<UTC-timestamp>.json` più un riepilogo Markdown
  su stdout. Vedi [`evals/README.md`](./evals/README.md) per variabili
  d'ambiente e stime di costo.

Paperasse (il progetto francese a cui questo repo si ispira) riporta un
guadagno del **+13 %** dal caricamento della skill vs baseline sulla sua
rubrica. Replichiamo la metodologia — **i tuoi numeri possono variare in
base al modello, alla copertura cantonale e alla locale**. Se esegui uno
sweep, invia per favore una PR con il report JSON sotto `evals/results/`.

---

## Struttura del progetto

```
.
├── fiduciaire/             # 6 skill, ciascuna:
│   ├── SKILL.md            #   inglese (predefinito — auto-caricato dai tool)
│   ├── SKILL.fr.md         #   francese
│   ├── SKILL.de.md         #   tedesco
│   ├── SKILL.it.md         #   italiano
│   ├── references/         #   sotto-riferimenti dettagliati (md)
│   ├── data/               #   tabelle JSON, aliquote, scale
│   ├── templates/          #   modelli di documento
│   ├── scripts/            #   helper specifici della skill
│   └── evals/              #   casi + rubrica di valutazione
├── expert-fiscal/  controleur-afc/  reviseur-agree/  notaire-cantonal/  regie/
├── data/
│   └── cantons/            # 26 file JSON cantonali (fonte unica)
├── evals/                  # runner di valutazione cross-skill (uv)
├── integrations/           # connettori bexio / Stripe / PostFinance (Node.js)
├── scripts/                # calc.js, generatore QR-fattura, helper
├── templates/              # modelli cross-skill
├── company.example.json    # contesto in input alle skill
├── marketplace.json        # metadati del registro skill
├── package.json            # dipendenze Node
└── .env.example
```

---

## Contribuire

Vedere [`CONTRIBUTING.md`](./CONTRIBUTING.md). Priorità: affinare i dati fiscali cantonali, tradurre i contenuti delle skill, aggiungere casi di valutazione, costruire template (fattura conforme IVA, contratto di locazione VD/GE, modulo ufficiale di aumento pigione).

Tutti i contributi sotto licenza MIT.

---

## ⚠️ Avvertenza

Queste skill sono **strumenti di assistenza**. Non sostituiscono un fiduciario qualificato, un esperto fiscale certificato, un revisore ASR, un notaio o un avvocato. Le aliquote cambiano ogni anno — verificare con le fonti ufficiali (AFC/ESTV, BAZG, autorità cantonali) prima di qualsiasi decisione vincolante.

---

## Fonti ufficiali

- [Amministrazione federale delle contribuzioni (AFC)](https://www.estv.admin.ch)
- [Fedlex — Raccolta sistematica del diritto federale](https://www.fedlex.admin.ch)
- [Conferenza svizzera delle imposte (CSI)](https://www.steuerkonferenz.ch)
- [Autorità federale di sorveglianza dei revisori (ASR)](https://www.rab-asr.ch)
- [Federazione svizzera dei notai](https://www.notaires.ch)
- [Ufficio federale delle abitazioni — tasso di riferimento](https://www.bwo.admin.ch)
