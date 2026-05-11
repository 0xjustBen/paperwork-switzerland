<sub>🌐 [English](./README.md) · **Français** · [Deutsch](./README.de.md) · [Italiano](./README.it.md)</sub>

![paperwork-switzerland](./assets/banner.svg)

![demo](./assets/demo.svg)

<h1 align="center">Paperwork Switzerland 🇨🇭</h1>

<p align="center">
  <b>Des skills pour agents IA spécialisés dans la paperasse suisse, sur les 26 cantons.</b>
</p>

<p align="center">
  <i>Parce que quelqu'un devait s'en charger, et ce quelqu'un n'a pas besoin de pause café.</i>
</p>

Inspiré de [`romainsimon/paperasse`](https://github.com/romainsimon/paperasse) (France) — même structure, contenu suisse : trois niveaux d'impôt (Confédération, cantons, communes), quatre langues officielles, 26 régimes cantonaux.

---

## Qu'est-ce que c'est ?

**Paperwork Switzerland est une collection de skills pour agents IA** ([Claude Code](https://claude.com/product/claude-code), [Codex](https://openai.com/codex/), [Cursor](https://cursor.com), [Windsurf](https://windsurf.com), [Cline](https://cline.bot), [Aider](https://aider.chat)) spécialisés dans la comptabilité, la fiscalité, la révision, le notariat et la gérance immobilière suisses.

Chaque skill transforme ton agent en copilote expert d'un métier suisse : comptabilité (CO 957ss, plan PME, TVA, bouclement), fiscalité fédérale et cantonale (LIFD, 26 régimes, IS frontaliers), contrôle AFC, révision (CO 727 / 727a, ASR), notariat cantonal (latin / libre / mixte), gérance (CO 253ss, PPE).

Les skills sont du Markdown. Le repo embarque aussi des connecteurs bancaires (**bexio**, **PostFinance** via ISO 20022) et paiements (**Stripe**), la génération de QR-facture suisse, et des calculateurs déterministes pour TVA, IFD et impôt PM cantonal.

---

## Installation rapide

### Option 1 — Demande à ton agent

```
Installe tous les skills depuis https://github.com/0xjustBen/paperwork-switzerland
Puis lance le setup pour gérer ma paperasse suisse
```

### Option 2 — Manuel

```bash
git clone https://github.com/0xjustBen/paperwork-switzerland.git
cd paperwork-switzerland
cp -r fiduciaire expert-fiscal controleur-afc reviseur-agree notaire-cantonal regie ~/.claude/skills/
npm install
uv sync --project evals
```

---

## Les 6 skills

| Skill | Rôle | Ce qu'il fait |
|-------|------|---------------|
| **`fiduciaire`** | Fiduciaire | Compta PME, TVA (8.1/2.6/3.8 %), salaires + AVS/LPP, bouclement (CO 957ss), IS par canton |
| **`expert-fiscal`** | Expert fiscal | PP & PM, IFD + 26 ICC, fortune, valeur locative, 3a, frontaliers, rulings |
| **`controleur-afc`** | Contrôleur AFC | Simulation contrôle FTA/ESTV sur 6 axes |
| **`reviseur-agree`** | Réviseur agréé | Révision ordinaire (CO 727) / restreinte (CO 727a), normes ASR, CO 725 |
| **`notaire-cantonal`** | Notaire cantonal | Système notarial par canton — immobilier, succession, sociétés |
| **`regie`** | Gérant | Baux (CO 253–274g), PPE (CC 712a ss), hausses, taux de référence OFL |

4 langues par skill : `SKILL.md` (anglais, défaut), `SKILL.fr.md`, `SKILL.de.md`, `SKILL.it.md`.

---

## Utilisation avec les agents IA

Les skills sont du Markdown brut — tout agent capable de lire des fichiers
peut les utiliser. Le repo est organisé pour que chaque dossier de skill
(`fiduciaire/`, `expert-fiscal/`, …) puisse être chargé directement comme
prompt système.

### Claude Code

```bash
cp -r fiduciaire expert-fiscal controleur-afc reviseur-agree notaire-cantonal regie ~/.claude/skills/
```
Claude Code détecte automatiquement `~/.claude/skills/*/SKILL.md` et route les
invocations selon la description du skill. Définis `CLAUDE_PROJECT_DIR` sur ce
repo pour garder `data/cantons/` et `scripts/calc.js` dans le périmètre.

### Codex / OpenAI

Codex CLI lit depuis `~/.codex/instructions.md`. Ajoutes-y le contenu du
`SKILL.md` pertinent, ou passe-le via `--system` à l'API. Pour l'API, définis
`OPENAI_API_KEY` et utilise `gpt-4o-mini` ou plus grand ; épingle le texte du
skill comme premier message `system` de chaque requête.

### Cursor

Ouvre le repo dans Cursor et ajoute le fichier de skill voulu dans **Cursor
Settings → Rules → Project Rules** (accepte directement les fichiers
Markdown). Tu peux aussi déposer `SKILL.md` dans `.cursorrules` à la racine du
repo pour un contexte global.

### Mistral via Le Chat / Codestral

Dans Le Chat, attache le `SKILL.md` pertinent comme fichier de connaissance
(les offres payantes supportent des instructions persistantes). Pour Codestral
ou l'API Mistral brute, définis `MISTRAL_API_KEY` et préfixe `SKILL.md` comme
message `system` — `mistral-small-latest` suffit dans la plupart des cas ;
`mistral-large-latest` pour les questions cantonales ambiguës.

### Aider

```bash
aider --read fiduciaire/SKILL.md --read data/cantons/ZH.json
```
Utilise `--read` pour un contexte en lecture seule ; Aider garde le skill
chargé pendant toute la session.

### Cline

Dans VS Code, ajoute les chemins de skill sous **Cline → Settings → Custom
Instructions**, ou pointe Cline sur le repo et demande-lui de « lire
fiduciaire/SKILL.md et le suivre ». Cline conserve les instructions
personnalisées par workspace.

### Windsurf

Dépose le texte du skill dans `.windsurfrules` à la racine du repo (Windsurf
le lit à chaque conversation). Pour des configurations multi-skills,
concatène les `SKILL.md` pertinents.

---

## Exemples

```
> Voici mes transactions bexio Q4. Catégorise-les et génère les écritures.
> Bouclement de ma SA zurichoise pour 2026.
> Compare la charge fiscale PM à ZG vs GE pour 500'000 CHF de bénéfice.
> Je suis frontalier français à Genève. Quelle imposition à la source ?
> Rédige une formule officielle de hausse de loyer à Lausanne (taux de référence OFL passé à 1.75 %).
> J'achète un chalet à Verbier. Frais de notaire et droits de mutation en Valais ?
```

---

## Données cantonales

[`data/cantons/`](./data/cantons) — un JSON par canton (code ISO 3166-2), schéma dans [`_schema.json`](./data/cantons/_schema.json). Utilisé par tous les skills et par les calculateurs déterministes.

Champs : nom officiel (multilingue), capitale, langues, URL de l'administration fiscale cantonale, système notarial, taux effectifs indicatifs, droits de mutation, spécificités cantonales.

---

## Calculateurs déterministes

Les LLM sont mauvais en arithmétique. Les skills délèguent chaque calcul à `scripts/calc.js` :

```bash
# TVA (en vigueur depuis 2024)
node scripts/calc.js vat --net 1000 --rate normal       # → 81.00
node scripts/calc.js vat-extract --gross 1081 --rate normal

# Impôt fédéral direct (IFD)
node scripts/calc.js ifd --profit 500000                 # → 39 170.51 CHF

# Estimation impôt PM combiné
node scripts/calc.js pm --canton ZG --profit 500000      # → 59 250.00 CHF (11.85 %)
node scripts/calc.js compare --cantons ZH,ZG,GE,VD,TI --profit 500000

# Seuil art. 10 LTVA
node scripts/calc.js vat-threshold --turnover 95000      # → non assujetti

# Droits de mutation immobilière
node scripts/calc.js mutation --canton GE --price 1200000

# Prorata, AVS, déduction de coordination LPP…
node scripts/calc.js --help
```

Sortie JSON, prête à être réinjectée dans les skills.

---

## Intégrations

| Connecteur | Description | Env requise |
|-----------|-------------|-------------|
| [bexio](integrations/bexio) | Compta PME suisse, transactions, contacts | `BEXIO_API_TOKEN` |
| [Stripe](integrations/stripe) | Charges, payouts, frais (CHF / EUR / USD) | `STRIPE_SECRET` |
| [PostFinance](integrations/postfinance) | Parser ISO 20022 camt.053 (fonctionne hors-ligne) | aucune |

```bash
npm run fetch:bexio
npm run fetch:stripe -- --start 2026-01-01
node integrations/postfinance/parse.js statement.xml > transactions.json
```

Voir [`integrations/README.md`](./integrations/README.md) et [`.env.example`](./.env.example).

---

## Évaluations

Cadre LLM-as-judge, modelé sur `romainsimon/paperasse`. Les skills sont exécutés avec et sans leur SKILL.md, puis notés sur l'exactitude, la citation des bases légales correctes (CO / LIFD / LTVA / CC) et l'absence de références franco-spécifiques (CGI, DGFIP, BOFiP).

```bash
uv run --project evals python evals/run_evals.py
uv run --project evals python evals/run_evals.py --skill fiduciaire
uv run --project evals python evals/aggregate_benchmark.py
```

---

## Méthodologie d'évaluation

Deux modes, même harnais (`evals/run_evals.py`) :

- **Mode stub** (par défaut, hors-ligne) — les sorties sont notées par
  correspondance de sous-chaîne sur `expected_themes` / `must_cite` /
  `must_not_cite`. Rapide, déterministe, aucune clé API requise. Idéal pour
  la CI sur les PR de prompts/données. Résultats dans `evals/runs/`.
- **Mode live** (`--mode=live --provider={anthropic,openai,mistral}`) — vrai
  LLM-as-judge : chaque cas est exécuté deux fois (avec et sans le skill
  chargé en prompt système), puis un second appel au même fournisseur note
  de 0 à 100 selon la rubrique. Résultats dans
  `evals/results/<provider>-<UTC-timestamp>.json` plus un résumé Markdown
  sur stdout. Voir [`evals/README.md`](./evals/README.md) pour les variables
  d'env et les estimations de coût.

Paperasse (le projet français dont ce repo s'inspire) rapporte un gain de
**+13 %** au chargement du skill vs baseline sur sa rubrique. Nous reprenons
la méthodologie — **tes chiffres peuvent varier selon le modèle, la
couverture cantonale et la locale**. Si tu lances un sweep, merci de
soumettre une PR avec le rapport JSON sous `evals/results/`.

---

## Structure du projet

```
.
├── fiduciaire/             # 6 skills, chacun :
│   ├── SKILL.md            #   anglais (défaut — auto-chargé par les outils)
│   ├── SKILL.fr.md         #   français
│   ├── SKILL.de.md         #   allemand
│   ├── SKILL.it.md         #   italien
│   ├── references/         #   sous-références détaillées (md)
│   ├── data/               #   tables JSON, taux, barèmes
│   ├── templates/          #   modèles de documents
│   ├── scripts/            #   helpers spécifiques au skill
│   └── evals/              #   cas + grilles d'évaluation
├── expert-fiscal/  controleur-afc/  reviseur-agree/  notaire-cantonal/  regie/
├── data/
│   └── cantons/            # 26 fichiers JSON cantonaux (source unique)
├── evals/                  # runner d'évaluation cross-skills (uv)
├── integrations/           # connecteurs bexio / Stripe / PostFinance (Node.js)
├── scripts/                # calc.js, générateur QR-facture, helpers
├── templates/              # modèles cross-skills
├── company.example.json    # contexte injecté dans les skills
├── marketplace.json        # métadonnées registre des skills
├── package.json            # deps Node
└── .env.example
```

---

## Contribuer

Voir [`CONTRIBUTING.md`](./CONTRIBUTING.md). Priorités : affiner les données fiscales cantonales, traduire le contenu des skills, ajouter des cas d'évaluation, construire des templates (facture conforme TVA, bail VD/GE, formule officielle de hausse de loyer).

Toutes les contributions sous licence MIT.

---

## ⚠️ Avertissement

Ces skills sont des **outils d'assistance**. Ils ne remplacent ni un fiduciaire qualifié, ni un expert fiscal certifié, ni un réviseur ASR, ni un notaire, ni un avocat. Les taux évoluent chaque année — à vérifier contre les sources officielles (ESTV/AFC, BAZG, autorités cantonales) avant toute décision contraignante.

---

## Sources officielles

- [Administration fédérale des contributions (AFC / ESTV)](https://www.estv.admin.ch)
- [Fedlex — Recueil systématique du droit fédéral](https://www.fedlex.admin.ch)
- [Conférence suisse des impôts (CSI / SSK)](https://www.steuerkonferenz.ch)
- [Autorité fédérale de surveillance en matière de révision (ASR / RAB)](https://www.rab-asr.ch)
- [Fédération suisse des notaires](https://www.notaires.ch)
- [Office fédéral du logement — taux de référence](https://www.bwo.admin.ch)
