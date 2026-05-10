<sub>🌐 [English](./CONTRIBUTING.md) · [Français](./CONTRIBUTING.fr.md) · **Deutsch** · [Italiano](./CONTRIBUTING.it.md)</sub>

# Mitwirken an paperwork-switzerland

Danke fürs Mithelfen. Dieses Projekt lebt von Fachleuten — Treuhändern, Steuerexperten, RAB-Revisoren, Notaren, Liegenschaftsverwaltern.

## Wie mitwirken

1. **Fork**
2. Branch: `git checkout -b feat/<kanton-oder-skill>`
3. Conventional Commits (`feat:`, `fix:`, `docs:`, `data:`)
4. **PR** auf `main`

## Beitragsarten

- **Kantonsdaten** (`data/cantons/<XX>.json`): ISO 3166-2, Quelle + `consulte_le`, keine Personendaten
- **Skills** (`<skill>/SKILL.md` + Varianten): max ~500 Zeilen, Rechtsgrundlage zitieren (OR, DBG, MWSTG, ZGB), 4 Sprachen anstreben
- **Templates**: Markdown/JSON/HTML, keine geschützten Logos
- **Evaluationen** (`<skill>/evals/evals.json`): anonymisierte Fälle
- **Integrationen** (`integrations/`): Node.js, Env-Variablen in `.env.example`
- **Deterministische Berechnungen** (`scripts/calc.js`): Subkommando + Test

## Qualität

- **Genauigkeit > Vollständigkeit**
- **Quellen zitieren**: Fedlex, ESTV, kantonale Verwaltungen
- **Mehrsprachig**: DE für Deutschschweiz, IT für TI, FR für Romandie; zweisprachige Kantone (BE, FR, VS, GR) beide Sprachen
- **Keine persönliche Beratung** in Skills

## Verhaltenskodex

Respektvoll. Kantonale Unterschiede sind die Norm.

## Lizenz

Beiträge unter MIT-Lizenz.
