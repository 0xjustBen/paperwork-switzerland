<sub>🌐 **English** · [Français](./CONTRIBUTING.fr.md) · [Deutsch](./CONTRIBUTING.de.md) · [Italiano](./CONTRIBUTING.it.md)</sub>

# Contributing to paperwork-switzerland

Thanks for helping. This project lives through practitioners — Treuhänder, tax experts, FAOA auditors, notaries, property managers — who share their knowledge.

## How to contribute

1. **Fork** the repo
2. Branch: `git checkout -b feat/<canton-or-skill>`
3. Conventional Commits encouraged (`feat:`, `fix:`, `docs:`, `data:`)
4. **PR** to `main`

## Contribution types

### Cantonal data (`data/cantons/<XX>.json`)

- ISO 3166-2 code (ZH, BE, …)
- Always cite source URL + `consulte_le` date
- No personal data, no real client cases

### Skills (`<skill>/SKILL.md` + variants)

- Markdown, max ~500 lines per main file — split into `references/*.md` otherwise
- Always cite the legal basis (CO, LIFD, LTVA, CC, etc.)
- Indicate the law version / update date in frontmatter `metadata.last_updated`
- 4-language parity is the goal: EN (default `SKILL.md`), FR/DE/IT siblings

### Templates (`templates/` or `<skill>/templates/`)

- Markdown / JSON / HTML
- No copyrighted official logos
- Header comment with usage and legal basis

### Evaluations (`<skill>/evals/evals.json`)

- Anonymized cases
- Fields: `id`, `input`, `expected_themes`, `must_cite`, `must_not_cite`
- Grading rubric in `<skill>/evals/grading.json`

### Integrations (`integrations/`)

- Node.js (matches `romainsimon/paperasse` convention)
- Env vars documented in `.env.example`
- Update `package.json` scripts

### Deterministic calculations (`scripts/calc.js`)

- Add a new subcommand for any calc the LLM should not do by itself
- Add a test in `scripts/test-deterministic-calculations.js`

## Quality

- **Accuracy > completeness** — one well-documented canton beats 26 approximate ones
- **Cite sources** — Fedlex, ESTV/FTA, official cantonal sites
- **Multilingual** — DE for ZH/BE/LU/…, IT for TI, FR for romandie. Bilingual cantons (BE, FR, VS, GR) deserve both
- **No personal advice** — skills are tools, not legal opinions

## Code of conduct

Be respectful. Differences between cantons are the norm, not a flaw.

## Quadrilingual sync

FR is canonical. EN/DE/IT must stay parallel — when one moves, the other three follow in the same PR.

Files requiring sync:

- `README.md` (EN) ↔ `README.fr.md` ↔ `README.de.md` ↔ `README.it.md`
- `CONTRIBUTING.md` (EN) ↔ `CONTRIBUTING.fr.md` ↔ `CONTRIBUTING.de.md` ↔ `CONTRIBUTING.it.md`
- For every skill: `<skill>/SKILL.md` ↔ `SKILL.fr.md` ↔ `SKILL.de.md` ↔ `SKILL.it.md`

Naming convention:

- `*.md` — English (default)
- `*.fr.md` — French (canonical content authority)
- `*.de.md` — German
- `*.it.md` — Italian

Monolingual changes (data, scripts, eval JSON) do not need translation, but reviewers will check that prompts, instructions, and user-facing strings stay in lockstep across the four files.

## License

By submitting a PR, you agree your contribution is published under MIT.
