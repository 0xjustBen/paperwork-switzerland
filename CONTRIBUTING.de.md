<sub>🌐 [English](./CONTRIBUTING.md) · [Français](./CONTRIBUTING.fr.md) · **Deutsch** · [Italiano](./CONTRIBUTING.it.md)</sub>

# Mitwirken an paperwork-switzerland

Danke fürs Mithelfen. Dieses Projekt lebt von Fachleuten — Treuhändern, Steuerexperten, RAB-Revisoren, Notaren und Liegenschaftsverwaltern — die ihr Wissen teilen.

## Wie mitwirken

1. **Fork** des Repos
2. Branch: `git checkout -b feat/<kanton-oder-skill>`
3. Conventional Commits empfohlen (`feat:`, `fix:`, `docs:`, `data:`)
4. **PR** auf `main`

## Beitragsarten

### Kantonsdaten (`data/cantons/<XX>.json`)

- ISO 3166-2 Code (ZH, BE, …)
- Immer Quell-URL + `consulte_le`-Datum angeben
- Keine personenbezogenen Daten, keine echten Mandantenfälle

### Skills (`<skill>/SKILL.md` + Varianten)

- Markdown, max. ~500 Zeilen pro Hauptdatei — sonst in `references/*.md` aufteilen
- Immer die Rechtsgrundlage zitieren (OR, DBG, MWSTG, ZGB usw.)
- Gesetzesfassung / Aktualisierungsdatum im Frontmatter `metadata.last_updated` angeben
- Ziel ist 4-Sprachen-Parität: EN (Standard `SKILL.md`), FR/DE/IT parallel

### Templates (`templates/` oder `<skill>/templates/`)

- Markdown / JSON / HTML
- Keine urheberrechtlich geschützten Amtslogos
- Kopfkommentar mit Verwendung und Rechtsgrundlage

### Evaluationen (`<skill>/evals/evals.json`)

- Anonymisierte Fälle
- Felder: `id`, `input`, `expected_themes`, `must_cite`, `must_not_cite`
- Bewertungsrubrik in `<skill>/evals/grading.json`

### Integrationen (`integrations/`)

- Node.js (Konvention von `romainsimon/paperasse`)
- Env-Variablen in `.env.example` dokumentieren
- `package.json`-Scripts aktualisieren

### Deterministische Berechnungen (`scripts/calc.js`)

- Neuen Subbefehl für jede Berechnung hinzufügen, die das LLM nicht selbst machen soll
- Test in `scripts/test-deterministic-calculations.js` ergänzen

## Qualität

- **Genauigkeit > Vollständigkeit** — ein gut dokumentierter Kanton schlägt 26 ungefähre
- **Quellen zitieren** — Fedlex, ESTV, offizielle kantonale Seiten
- **Mehrsprachig** — DE für ZH/BE/LU/…, IT für TI, FR für die Romandie. Zweisprachige Kantone (BE, FR, VS, GR) verdienen beide Sprachen
- **Keine persönliche Beratung** — Skills sind Werkzeuge, keine Rechtsgutachten

## Verhaltenskodex

Respektvoll bleiben. Kantonale Unterschiede sind die Norm, kein Fehler.

## Viersprachige Synchronisation

FR ist kanonisch. EN/DE/IT müssen parallel bleiben — bewegt sich eine
Version, ziehen die drei anderen im selben PR nach.

Zu synchronisierende Dateien:

- `README.md` (EN) ↔ `README.fr.md` ↔ `README.de.md` ↔ `README.it.md`
- `CONTRIBUTING.md` (EN) ↔ `CONTRIBUTING.fr.md` ↔ `CONTRIBUTING.de.md` ↔ `CONTRIBUTING.it.md`
- Für jeden Skill: `<skill>/SKILL.md` ↔ `SKILL.fr.md` ↔ `SKILL.de.md` ↔ `SKILL.it.md`

Namenskonvention:

- `*.md` — Englisch (Standard)
- `*.fr.md` — Französisch (kanonische Inhalts-Autorität)
- `*.de.md` — Deutsch
- `*.it.md` — Italienisch

Monolinguale Änderungen (Daten, Skripte, Eval-JSON) brauchen keine
Übersetzung, aber Reviewer prüfen, dass Prompts, Instruktionen und
benutzerseitige Texte über die vier Dateien hinweg im Gleichschritt bleiben.

## Lizenz

Mit dem Einreichen eines PR akzeptierst du, dass dein Beitrag unter MIT veröffentlicht wird.


---

_Diese Fassung ist eine Übersetzung der kanonischen Version [CONTRIBUTING.md](./CONTRIBUTING.md)._
