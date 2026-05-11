<sub>🌐 [English](./README.md) · [Français](./README.fr.md) · **Deutsch** · [Italiano](./README.it.md)</sub>

![paperwork-switzerland](./assets/banner.svg)

![demo](./assets/demo.svg)

<h1 align="center">Paperwork Switzerland 🇨🇭</h1>

<p align="center">
  <b>KI-Agenten-Skills für die Schweizer Bürokratie — alle 26 Kantone.</b>
</p>

<p align="center">
  <i>Weil jemand das Papierkram machen musste, und der jemand keine Kaffeepause braucht.</i>
</p>

Inspiriert von [`romainsimon/paperasse`](https://github.com/romainsimon/paperasse) (FR) — gleiche Struktur, Schweizer Inhalt: drei Steuerebenen (Bund, Kantone, Gemeinden), vier Amtssprachen, 26 kantonale Regimes.

---

## Was ist das?

**Paperwork Switzerland ist eine Sammlung von Skills für KI-Agenten** ([Claude Code](https://claude.com/product/claude-code), [Codex](https://openai.com/codex/), [Cursor](https://cursor.com), [Windsurf](https://windsurf.com), [Cline](https://cline.bot), [Aider](https://aider.chat)) spezialisiert auf Schweizer Buchhaltung, Steuern, Revision, Notariat und Liegenschaftsverwaltung.

Jeder Skill verwandelt deinen Agenten in einen Experten-Copiloten: Buchhaltung (OR 957ff, KMU-Kontenplan, MwSt, Jahresabschluss), Bundes- und Kantonssteuern (DBG, 26 Regimes, Quellensteuer, Grenzgänger), ESTV-Prüfung, Revision (OR 727 / 727a, RAB), kantonales Notariat (lateinisch / frei / gemischt), Liegenschaftsverwaltung (OR 253ff, Stockwerkeigentum).

Die Skills sind Markdown. Das Repo enthält auch Bankkonnektoren (**bexio**, **PostFinance** via ISO 20022) und Zahlungen (**Stripe**), Swiss QR-Bill-Generation und deterministische Rechner für MwSt, DBST und kantonale Gewinnsteuer.

---

## Schnellinstallation

### Option 1 — Agent installiert

```
Installiere alle Skills von https://github.com/0xjustBen/paperwork-switzerland
Starte dann das Setup für meine Schweizer Bürokratie
```

### Option 2 — Manuell

```bash
git clone https://github.com/0xjustBen/paperwork-switzerland.git
cd paperwork-switzerland
cp -r fiduciaire expert-fiscal controleur-afc reviseur-agree notaire-cantonal regie ~/.claude/skills/
npm install
uv sync --project evals
```

---

## Die 6 Skills

| Skill | Rolle | Was er macht |
|-------|-------|--------------|
| **`fiduciaire`** | Treuhänder | KMU-Buchhaltung, MwSt (8.1/2.6/3.8 %), Lohn + AHV/BVG, Jahresabschluss (OR 957ff) |
| **`expert-fiscal`** | Steuerexperte | NP & JP, DBST + 26 Kantonssteuern, Vermögen, Eigenmietwert, Säule 3a, Grenzgänger |
| **`controleur-afc`** | ESTV-Prüfer | Simulation ESTV-/kantonale Prüfung auf 6 Achsen |
| **`reviseur-agree`** | Zugelassener Revisor | Ordentlich (OR 727) / eingeschränkt (OR 727a), RAB-Standards, OR 725 |
| **`notaire-cantonal`** | Kantonaler Notar | Notariatssystem pro Kanton — Immobilien, Erbrecht, Gesellschaften |
| **`regie`** | Liegenschaftsverwalter | Mietrecht (OR 253–274g), Stockwerkeigentum (ZGB 712a ff), BWO-Referenzzinssatz |

4 Sprachen pro Skill: `SKILL.md` (Englisch, Standard), `SKILL.fr.md`, `SKILL.de.md`, `SKILL.it.md`.

---

## Nutzung mit KI-Agenten

Die Skills sind reines Markdown — jeder Agent, der Dateien lesen kann, kann
sie nutzen. Das Repo ist so aufgebaut, dass jedes Skill-Verzeichnis
(`fiduciaire/`, `expert-fiscal/`, …) direkt als System-Prompt geladen werden
kann.

### Claude Code

```bash
cp -r fiduciaire expert-fiscal controleur-afc reviseur-agree notaire-cantonal regie ~/.claude/skills/
```
Claude Code erkennt `~/.claude/skills/*/SKILL.md` automatisch und routet
Aufrufe anhand der Skill-Beschreibung. Setze `CLAUDE_PROJECT_DIR` auf dieses
Repo, damit `data/cantons/` und `scripts/calc.js` im Geltungsbereich bleiben.

### Codex / OpenAI

Codex CLI liest aus `~/.codex/instructions.md`. Hänge dort den Inhalt des
passenden `SKILL.md` an oder übergib ihn via `--system` an die API. Für die
API setze `OPENAI_API_KEY` und nutze `gpt-4o-mini` oder grösser; pinne den
Skill-Text als erste `system`-Nachricht jeder Anfrage.

### Cursor

Öffne das Repo in Cursor und füge die gewünschte Skill-Datei unter **Cursor
Settings → Rules → Project Rules** hinzu (akzeptiert Markdown-Dateien
direkt). Alternativ kannst du `SKILL.md` als `.cursorrules` im Repo-Root
ablegen für repo-weiten Kontext.

### Mistral via Le Chat / Codestral

In Le Chat hängst du das passende `SKILL.md` als Wissensdatei an
(kostenpflichtige Tarife unterstützen persistente Instruktionen). Für
Codestral oder die rohe Mistral-API setze `MISTRAL_API_KEY` und stelle
`SKILL.md` als `system`-Nachricht voran — `mistral-small-latest` reicht
meist; `mistral-large-latest` für mehrdeutige Kantonsfragen.

### Aider

```bash
aider --read fiduciaire/SKILL.md --read data/cantons/ZH.json
```
`--read` für Read-only-Kontext; Aider behält den Skill über die Session
geladen.

### Cline

Füge in VS Code die Skill-Pfade unter **Cline → Settings → Custom
Instructions** hinzu, oder zeige Cline auf das Repo und bitte es, „lies
fiduciaire/SKILL.md und folge ihm". Cline speichert Custom Instructions pro
Workspace.

### Windsurf

Lege den Skill-Text als `.windsurfrules` im Repo-Root ab (Windsurf liest sie
bei jeder Konversation). Für Multi-Skill-Setups konkateniere die relevanten
`SKILL.md`-Dateien.

---

## Beispiele

```
> Hier meine bexio-Transaktionen für Q4. Kategorisiere und buche.
> Jahresabschluss meiner Zürcher AG für 2026.
> Vergleiche die Gewinnsteuerbelastung in ZG vs GE bei CHF 500'000.
> Ich bin französischer Grenzgänger in Genf. Quellensteuerpflicht?
> Amtliches Mietzinserhöhungsformular Lausanne, Referenzzinssatz auf 1.75 % gestiegen.
> Chalet-Kauf in Verbier. Notarkosten und Handänderungssteuer im Wallis?
```

---

## Kantonsdaten

[`data/cantons/`](./data/cantons) — eine JSON-Datei pro Kanton (ISO 3166-2-Code), Schema in [`_schema.json`](./data/cantons/_schema.json). Wird von allen Skills und den deterministischen Rechnern verwendet.

Felder: offizieller Name (mehrsprachig), Hauptstadt, Sprachen, URL der kantonalen Steuerverwaltung, Notariatssystem, indikative effektive Sätze, Handänderungssteuern, kantonale Besonderheiten.

---

## Deterministische Rechner

LLMs sind schlecht im Rechnen. Skills delegieren jede Berechnung an `scripts/calc.js`:

```bash
# MwSt (in Kraft seit 2024)
node scripts/calc.js vat --net 1000 --rate normal       # → 81.00
node scripts/calc.js vat-extract --gross 1081 --rate normal

# Direkte Bundessteuer (DBST)
node scripts/calc.js ifd --profit 500000                 # → 39 170.51 CHF

# Kombinierte Gewinnsteuer-Schätzung
node scripts/calc.js pm --canton ZG --profit 500000      # → 59 250.00 CHF (11.85 %)
node scripts/calc.js compare --cantons ZH,ZG,GE,VD,TI --profit 500000

# Schwelle Art. 10 MWSTG
node scripts/calc.js vat-threshold --turnover 95000      # → nicht steuerpflichtig

# Handänderungssteuer
node scripts/calc.js mutation --canton GE --price 1200000

# Pro-rata, AHV-Beiträge, BVG-Koordinationsabzug…
node scripts/calc.js --help
```

Ausgabe als JSON, direkt in Skills einspeisbar.

---

## Integrationen

| Konnektor | Beschreibung | Env |
|-----------|--------------|-----|
| [bexio](integrations/bexio) | Schweizer KMU-Buchhaltung, Transaktionen, Kontakte | `BEXIO_API_TOKEN` |
| [Stripe](integrations/stripe) | Charges, Payouts, Gebühren (CHF / EUR / USD) | `STRIPE_SECRET` |
| [PostFinance](integrations/postfinance) | ISO-20022-camt.053-Parser (offline) | — |

```bash
npm run fetch:bexio
npm run fetch:stripe -- --start 2026-01-01
node integrations/postfinance/parse.js statement.xml > transactions.json
```

Siehe [`integrations/README.md`](./integrations/README.md) und [`.env.example`](./.env.example).

---

## Evaluationen

LLM-as-judge-Framework nach `romainsimon/paperasse`. Skills laufen mit und ohne ihre SKILL.md, dann werden sie auf Genauigkeit, Zitation der korrekten Rechtsgrundlagen (OR / DBG / MWSTG / ZGB) und Abwesenheit französisch-spezifischer Referenzen (CGI, DGFIP, BOFiP) bewertet.

```bash
uv run --project evals python evals/run_evals.py
```

---

## Evaluationsmethodik

Zwei Modi, dasselbe Harness (`evals/run_evals.py`):

- **Stub-Modus** (Standard, offline) — Ausgaben werden per Substring-Matching
  gegen `expected_themes` / `must_cite` / `must_not_cite` bewertet. Schnell,
  deterministisch, kein API-Key nötig. Gut für CI bei Prompt-/Daten-PRs.
  Ergebnisse landen in `evals/runs/`.
- **Live-Modus** (`--mode=live --provider={anthropic,openai,mistral}`) —
  echtes LLM-as-Judge: jeder Fall läuft zweimal (mit und ohne Skill als
  System-Prompt), dann bewertet ein zweiter Aufruf desselben Providers 0–100
  nach Rubrik. Ergebnisse in `evals/results/<provider>-<UTC-timestamp>.json`
  plus Markdown-Zusammenfassung auf stdout. Siehe
  [`evals/README.md`](./evals/README.md) für Env-Variablen und
  Kostenschätzungen.

Paperasse (das französische Schwesterprojekt, dem dieses Repo nachempfunden
ist) berichtet einen Zuwachs von **+13 %** durch Skill-Laden gegenüber
Baseline auf seiner Rubrik. Wir replizieren die Methodik — **deine Zahlen
können je nach Modell, Kantons-Abdeckung und Locale abweichen**. Wenn du
einen Sweep fährst, reiche bitte einen PR mit dem JSON-Report unter
`evals/results/` ein.

---

## Projektstruktur

```
.
├── fiduciaire/             # 6 Skills, jeweils:
│   ├── SKILL.md            #   Englisch (Standard — wird von Tools auto-geladen)
│   ├── SKILL.fr.md         #   Französisch
│   ├── SKILL.de.md         #   Deutsch
│   ├── SKILL.it.md         #   Italienisch
│   ├── references/         #   detaillierte Sub-Referenzen (md)
│   ├── data/               #   JSON-Tabellen, Sätze, Skalen
│   ├── templates/          #   Dokumentvorlagen
│   ├── scripts/            #   Skill-spezifische Helpers
│   └── evals/              #   Eval-Fälle + Bewertung
├── expert-fiscal/  controleur-afc/  reviseur-agree/  notaire-cantonal/  regie/
├── data/
│   └── cantons/            # 26 kantonale JSON-Dateien (Single Source of Truth)
├── evals/                  # Eval-Runner Skill-übergreifend (uv)
├── integrations/           # bexio / Stripe / PostFinance Konnektoren (Node.js)
├── scripts/                # calc.js, QR-Bill-Generator, Helpers
├── templates/              # Skill-übergreifende Vorlagen
├── company.example.json    # Kontext-Eingabe für Skills
├── marketplace.json        # Skill-Registry-Metadaten
├── package.json            # Node-Abhängigkeiten
└── .env.example
```

---

## Mitwirken

Siehe [`CONTRIBUTING.md`](./CONTRIBUTING.md). Prioritäten: kantonale Steuerdaten verfeinern, Skill-Inhalte übersetzen, Eval-Fälle hinzufügen, Vorlagen bauen (MwSt-konforme Rechnung, VD/GE-Mietvertrag, amtliches Mietzinserhöhungsformular).

Alle Beiträge MIT-lizenziert.

---

## ⚠️ Haftungsausschluss

Diese Skills sind **Hilfsmittel**. Sie ersetzen keinen diplomierten Treuhänder, zertifizierten Steuerexperten, RAB-Revisor, Notar oder Anwalt. Steuersätze ändern sich jährlich — vor jeder verbindlichen Entscheidung mit offiziellen Quellen (ESTV, BAZG, kantonale Behörden) abgleichen.

---

## Offizielle Quellen

- [Eidgenössische Steuerverwaltung (ESTV)](https://www.estv.admin.ch)
- [Fedlex — Systematische Sammlung des Bundesrechts](https://www.fedlex.admin.ch)
- [Schweizerische Steuerkonferenz (SSK)](https://www.steuerkonferenz.ch)
- [Eidgenössische Revisionsaufsichtsbehörde (RAB)](https://www.rab-asr.ch)
- [Schweizerischer Notarenverband](https://www.notaires.ch)
- [Bundesamt für Wohnungswesen — Referenzzinssatz](https://www.bwo.admin.ch)
