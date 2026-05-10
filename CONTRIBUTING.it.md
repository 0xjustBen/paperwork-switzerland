<sub>🌐 [English](./CONTRIBUTING.md) · [Français](./CONTRIBUTING.fr.md) · [Deutsch](./CONTRIBUTING.de.md) · **Italiano**</sub>

# Contribuire a paperwork-switzerland

Grazie per l'aiuto. Questo progetto vive grazie ai professionisti — fiduciari, fiscalisti, revisori ASR, notai, amministratori immobiliari.

## Come contribuire

1. **Fork**
2. Branch: `git checkout -b feat/<cantone-o-skill>`
3. Conventional Commits (`feat:`, `fix:`, `docs:`, `data:`)
4. **PR** verso `main`

## Tipi di contributi

- **Dati cantonali** (`data/cantons/<XX>.json`): ISO 3166-2, fonte + `consulte_le`, nessun dato personale
- **Skill** (`<skill>/SKILL.md` + varianti): max ~500 righe, base legale (CO, LIFD, LIVA, CC), 4 lingue
- **Template**: Markdown/JSON/HTML, niente loghi protetti
- **Valutazioni** (`<skill>/evals/evals.json`): casi anonimizzati
- **Integrazioni** (`integrations/`): Node.js, variabili d'ambiente in `.env.example`
- **Calcoli deterministici** (`scripts/calc.js`): sottocomando + test

## Qualità

- **Esattezza > completezza**
- **Citare le fonti**: Fedlex, AFC, siti cantonali ufficiali
- **Multilingue**: DE per la Svizzera tedesca, IT per il TI, FR per la Romandia; cantoni bilingui (BE, FR, VS, GR) entrambe le lingue
- **Nessun consiglio personalizzato** nelle skill

## Codice di condotta

Rispetto reciproco. Le differenze tra cantoni sono la norma.

## Licenza

Contributi sotto licenza MIT.


---

_Quadrilingual sync rules: see [CONTRIBUTING.md](./CONTRIBUTING.md) — FR canonical, EN/DE/IT parallel._
