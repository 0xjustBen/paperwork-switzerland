<sub>🌐 [English](./CONTRIBUTING.md) · **Français** · [Deutsch](./CONTRIBUTING.de.md) · [Italiano](./CONTRIBUTING.it.md)</sub>

# Contribuer à paperwork-switzerland

Merci de vouloir aider. Ce projet vit grâce aux praticiens — fiduciaires, fiscalistes, réviseurs ASR, notaires, gérants — qui partagent leur savoir.

## Comment contribuer

1. **Fork** du dépôt
2. Branche : `git checkout -b feat/<canton-ou-skill>`
3. Conventional Commits encouragés (`feat:`, `fix:`, `docs:`, `data:`)
4. **PR** vers `main`

## Types de contributions

### Données cantonales (`data/cantons/<XX>.json`)

- Code ISO 3166-2 (ZH, BE, …)
- Toujours citer URL source + `consulte_le`
- Pas de données nominatives ni de cas clients réels

### Skills (`<skill>/SKILL.md` + variantes)

- Markdown, max ~500 lignes par fichier principal — découper en `references/*.md` sinon
- Toujours citer la base légale (CO, LIFD, LTVA, CC, etc.)
- Indiquer la version de la loi / date de mise à jour dans le frontmatter `metadata.last_updated`
- Parité 4 langues visée : EN (défaut `SKILL.md`), FR/DE/IT en parallèle

### Templates (`templates/` ou `<skill>/templates/`)

- Markdown / JSON / HTML
- Pas de logos officiels sous copyright
- En-tête commentaire avec usage et base légale

### Évaluations (`<skill>/evals/evals.json`)

- Cas anonymisés
- Champs : `id`, `input`, `expected_themes`, `must_cite`, `must_not_cite`
- Rubrique de notation dans `<skill>/evals/grading.json`

### Intégrations (`integrations/`)

- Node.js (convention `romainsimon/paperasse`)
- Variables d'env documentées dans `.env.example`
- Mettre à jour les scripts `package.json`

### Calculs déterministes (`scripts/calc.js`)

- Ajouter une sous-commande pour tout calcul que le LLM ne devrait pas faire seul
- Ajouter un test dans `scripts/test-deterministic-calculations.js`

## Qualité

- **Exactitude > complétude** — mieux vaut un canton bien documenté que 26 approximatifs
- **Citer les sources** — Fedlex, AFC/ESTV, sites cantonaux officiels
- **Multilingue** — DE pour ZH/BE/LU/…, IT pour TI, FR pour la romandie. Cantons bilingues (BE, FR, VS, GR) méritent les deux
- **Pas de conseil personnel** — les skills sont des outils, pas des avis juridiques

## Code de conduite

Respect mutuel. Les différences entre cantons sont la norme.

## Synchronisation quadrilingue

Le FR est canonique. EN/DE/IT doivent rester parallèles — quand l'un bouge,
les trois autres suivent dans la même PR.

Fichiers à synchroniser :

- `README.md` (EN) ↔ `README.fr.md` ↔ `README.de.md` ↔ `README.it.md`
- `CONTRIBUTING.md` (EN) ↔ `CONTRIBUTING.fr.md` ↔ `CONTRIBUTING.de.md` ↔ `CONTRIBUTING.it.md`
- Pour chaque skill : `<skill>/SKILL.md` ↔ `SKILL.fr.md` ↔ `SKILL.de.md` ↔ `SKILL.it.md`

Convention de nommage :

- `*.md` — anglais (défaut)
- `*.fr.md` — français (autorité canonique sur le contenu)
- `*.de.md` — allemand
- `*.it.md` — italien

Les changements monolingues (données, scripts, JSON d'eval) n'ont pas besoin
d'être traduits, mais les relecteurs vérifient que les prompts, instructions
et chaînes visibles par l'utilisateur restent alignés sur les quatre
fichiers.

## Licence

En soumettant une PR, tu acceptes que ta contribution soit publiée sous MIT.


---

_Cette version est une traduction de la version canonique [CONTRIBUTING.md](./CONTRIBUTING.md)._
