<sub>🌐 [English](./README.md) · **Français** · [Deutsch](./README.de.md) · [Italiano](./README.it.md)</sub>

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

[`data/cantons/`](./data/cantons) — un JSON par canton, schéma dans [`_schema.json`](./data/cantons/_schema.json).

## Calculateurs déterministes

```bash
node scripts/calc.js vat --net 1000 --rate normal
node scripts/calc.js ifd --profit 500000
node scripts/calc.js pm --canton ZG --profit 500000
node scripts/calc.js compare --cantons ZH,ZG,GE,VD,TI --profit 500000
```

## Intégrations

| Connecteur | Description | Env requise |
|-----------|-------------|-------------|
| [bexio](integrations/bexio) | Compta PME suisse | `BEXIO_API_TOKEN` |
| [Stripe](integrations/stripe) | Paiements | `STRIPE_SECRET` |
| [PostFinance](integrations/postfinance) | Parser ISO 20022 camt.053 (offline) | aucune |

## Évaluations

Cadre LLM-as-judge, modelé sur `romainsimon/paperasse`. Cas par skill dans `<skill>/evals/evals.json`, rubrique dans `<skill>/evals/grading.json`.

```bash
uv run --project evals python evals/run_evals.py
uv run --project evals python evals/run_evals.py --skill fiduciaire
uv run --project evals python evals/aggregate_benchmark.py
```

---

## ⚠️ Avertissement

Outils d'assistance. Ne remplacent pas fiduciaire, expert fiscal, réviseur ASR, notaire ou avocat agréés. Vérifier contre sources officielles (ESTV/AFC, BAZG, cantons).

## Sources

- [AFC / ESTV](https://www.estv.admin.ch) · [Fedlex](https://www.fedlex.admin.ch) · [CSI](https://www.steuerkonferenz.ch) · [ASR / RAB](https://www.rab-asr.ch) · [FSN](https://www.notaires.ch) · [OFL — taux de référence](https://www.bwo.admin.ch)
