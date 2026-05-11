<sub>🌐 [English](./CONTRIBUTING.md) · [Français](./CONTRIBUTING.fr.md) · [Deutsch](./CONTRIBUTING.de.md) · **Italiano**</sub>

# Contribuire a paperwork-switzerland

Grazie per l'aiuto. Questo progetto vive grazie ai professionisti — fiduciari, fiscalisti, revisori ASR, notai, amministratori immobiliari — che condividono il loro sapere.

## Come contribuire

1. **Fork** del repo
2. Branch: `git checkout -b feat/<cantone-o-skill>`
3. Conventional Commits consigliati (`feat:`, `fix:`, `docs:`, `data:`)
4. **PR** verso `main`

## Tipi di contributi

### Dati cantonali (`data/cantons/<XX>.json`)

- Codice ISO 3166-2 (ZH, BE, …)
- Citare sempre URL della fonte + data `consulte_le`
- Nessun dato personale, nessun caso cliente reale

### Skill (`<skill>/SKILL.md` + varianti)

- Markdown, max ~500 righe per file principale — altrimenti suddividere in `references/*.md`
- Citare sempre la base legale (CO, LIFD, LIVA, CC, ecc.)
- Indicare la versione della legge / data di aggiornamento nel frontmatter `metadata.last_updated`
- Obiettivo: parità su 4 lingue: EN (`SKILL.md` predefinito), FR/DE/IT in parallelo

### Template (`templates/` o `<skill>/templates/`)

- Markdown / JSON / HTML
- Niente loghi ufficiali protetti da copyright
- Intestazione con uso e base legale

### Valutazioni (`<skill>/evals/evals.json`)

- Casi anonimizzati
- Campi: `id`, `input`, `expected_themes`, `must_cite`, `must_not_cite`
- Rubrica di valutazione in `<skill>/evals/grading.json`

### Integrazioni (`integrations/`)

- Node.js (convenzione di `romainsimon/paperasse`)
- Variabili d'ambiente documentate in `.env.example`
- Aggiornare gli script di `package.json`

### Calcoli deterministici (`scripts/calc.js`)

- Aggiungere un sottocomando per ogni calcolo che l'LLM non dovrebbe fare da solo
- Aggiungere un test in `scripts/test-deterministic-calculations.js`

## Qualità

- **Esattezza > completezza** — meglio un cantone ben documentato che 26 approssimativi
- **Citare le fonti** — Fedlex, AFC/ESTV, siti cantonali ufficiali
- **Multilingue** — DE per ZH/BE/LU/…, IT per il TI, FR per la Romandia. I cantoni bilingui (BE, FR, VS, GR) meritano entrambe le lingue
- **Nessuna consulenza personale** — le skill sono strumenti, non pareri legali

## Codice di condotta

Rispetto reciproco. Le differenze tra cantoni sono la norma, non un difetto.

## Sincronizzazione quadrilingue

Il FR è canonico. EN/DE/IT devono restare paralleli — quando uno si muove,
gli altri tre seguono nella stessa PR.

File da sincronizzare:

- `README.md` (EN) ↔ `README.fr.md` ↔ `README.de.md` ↔ `README.it.md`
- `CONTRIBUTING.md` (EN) ↔ `CONTRIBUTING.fr.md` ↔ `CONTRIBUTING.de.md` ↔ `CONTRIBUTING.it.md`
- Per ogni skill: `<skill>/SKILL.md` ↔ `SKILL.fr.md` ↔ `SKILL.de.md` ↔ `SKILL.it.md`

Convenzione di denominazione:

- `*.md` — inglese (predefinito)
- `*.fr.md` — francese (autorità canonica sui contenuti)
- `*.de.md` — tedesco
- `*.it.md` — italiano

Le modifiche monolingue (dati, script, JSON di eval) non necessitano di
traduzione, ma i revisori verificano che prompt, istruzioni e stringhe
visibili all'utente restino allineati sui quattro file.

## Licenza

Inviando una PR, accetti che il tuo contributo sia pubblicato sotto licenza MIT.


---

_Questa versione è una traduzione della versione canonica [CONTRIBUTING.md](./CONTRIBUTING.md)._
