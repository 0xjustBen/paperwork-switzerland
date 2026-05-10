<sub>🌐 **English** · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [Italiano](./README.it.md)</sub>

<h1 align="center">Paperwork Switzerland 🇨🇭</h1>

<p align="center">
  <b>AI agent skills specialized in Swiss bureaucracy, covering all 26 cantons.</b>
</p>

<p align="center">
  <i>Because someone had to do the paperwork, and that someone doesn't need a coffee break.</i>
</p>

<p align="center">
  <a href="https://github.com/0xjustBen/paperwork-switzerland/stargazers"><img src="https://img.shields.io/github/stars/0xjustBen/paperwork-switzerland" alt="GitHub stars"></a>
  <img src="https://img.shields.io/badge/cantons-26%2F26-brightgreen" alt="26 cantons">
  <img src="https://img.shields.io/badge/languages-EN%20%C2%B7%20FR%20%C2%B7%20DE%20%C2%B7%20IT-blue" alt="Languages">
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/0xjustBen/paperwork-switzerland?style=flat&color=blue" alt="License"></a>
</p>

Inspired by [`romainsimon/paperasse`](https://github.com/romainsimon/paperasse) (France) — same shape, Swiss content: three tax tiers (Confederation / canton / commune), four official languages, 26 cantonal regimes.

---

## What is Paperwork Switzerland?

**Paperwork Switzerland is a collection of skills for AI agents** ([Claude Code](https://claude.com/product/claude-code), [Claude Cowork](https://claude.com/product/cowork), [Codex](https://openai.com/codex/), [Cursor](https://cursor.com), [Windsurf](https://windsurf.com), [Cline](https://cline.bot), [Aider](https://aider.chat)) specialized in Swiss accounting, taxation, audit, notarial law, and property management.

Each skill turns your agent into an expert copilot for one piece of Swiss paperwork: bookkeeping (CO 957ff, Swiss SME chart of accounts, VAT, year-end), federal & cantonal taxation (LIFD / DBG, 26 cantonal regimes, withholding tax, frontalier rules), tax audit (FTA / ESTV procedures), statutory audit (ordinary CO 727 / limited CO 727a, FAOA standards), notarial deeds (variable cantonal systems: Latin, free, mixed), and property management (CO 253ff leases, CC 712a ff condominium, OFL reference rate).

The skills are Markdown — usable by any agent that can read files. The repo also ships connectors to pull bank transactions (**bexio**, **PostFinance** via ISO 20022) and payments (**Stripe**), Swiss QR-bill generation, and deterministic calculators for VAT, IFD, and combined cantonal corporate tax.

---

## Quick install

### Option 1 — Tell your agent to install it

Paste this into your AI agent:

```
Install all skills from the GitHub repo https://github.com/0xjustBen/paperwork-switzerland
Then run the setup to manage all my Swiss paperwork
```

The agent clones the repo, copies the skills into the right place, and walks you through `company.example.json` setup (legal form, canton, VAT method, accounts).

### Option 2 — Manual install

```bash
git clone https://github.com/0xjustBen/paperwork-switzerland.git
cd paperwork-switzerland

# install skills into Claude Code
cp -r fiduciaire expert-fiscal controleur-afc reviseur-agree notaire-cantonal regie ~/.claude/skills/

# Node deps for integrations + calculators
npm install

# Python deps for eval runner (uv)
uv sync --project evals
```

---

## The 6 skills

| Skill | Role | What it does |
|-------|------|--------------|
| **`fiduciaire`** | Trustee / Treuhänder | Bookkeeping (Swiss SME COA), VAT (8.1 / 2.6 / 3.8 %, effective vs net tax debt rate), payroll + AHV/IV/EO/BVG, year-end closing (CO 957ff), withholding tax tables per canton |
| **`expert-fiscal`** | Tax Expert | Individuals & companies, federal direct tax (LIFD), 26 cantonal regimes, wealth tax, imputed rental value, pillar 3a / BVG buybacks, frontalier rules, rulings |
| **`controleur-afc`** | Tax Auditor | Simulated FTA / cantonal audit across 6 axes: VAT, profit tax, withholding tax, anticipatory tax (LIA), individuals, stamp duty |
| **`reviseur-agree`** | Licensed Auditor | Ordinary (CO 727) vs limited (CO 727a) audit, Swiss Auditing Standards (PS), Standard for limited audit (SER), FAOA independence rules, CO 725 going concern |
| **`notaire-cantonal`** | Cantonal Notary | Cantonal notarial system identification (Latin / free / mixed), real estate (CC 657), succession (CC 457ff, 2023 reform), matrimonial regimes, company formation (SA / GmbH) |
| **`regie`** | Property Manager | Leases (CO 253–274g), official rent-increase form, OFL reference mortgage rate, condominium (CC 712a ff), LDTR, eviction summary procedure |

Each skill ships in **4 languages**: `SKILL.md` (English, default), `SKILL.fr.md`, `SKILL.de.md`, `SKILL.it.md`.

---

## Usage examples

```
> Here are my Qonto-equivalent bexio transactions for Q4. Categorize them and produce the entries.

> Run the year-end closing for my SA in Zurich for 2026.

> Estimate my combined corporate tax burden in ZG vs GE on CHF 500'000 pre-tax profit.

> I'm a French frontalier working in Geneva. What's my withholding tax obligation?

> Draft an official rent-increase notice for a Lausanne apartment, given the OFL reference rate just rose to 1.75 %.

> I'm buying a chalet in Verbier. What are the notary fees and transfer duties in Valais?
```

---

## Cantonal data

[`data/cantons/`](./data/cantons): one JSON per canton (ISO 3166-2 code), schema in [`_schema.json`](./data/cantons/_schema.json). Used by all skills and by the deterministic calculators.

Fields: official name (multilingual), capital, languages, cantonal tax administration URL, notarial system, indicative effective rates, transfer duties, cantonal specifics.

---

## Deterministic calculators

LLMs are bad at arithmetic. Skills delegate every calculation to `scripts/calc.js`:

```bash
# VAT (in force since 2024)
node scripts/calc.js vat --net 1000 --rate normal       # → 81.00
node scripts/calc.js vat-extract --gross 1081 --rate normal

# Federal direct tax (DBST)
node scripts/calc.js ifd --profit 500000                 # → 39 170.51 CHF

# Combined corporate tax estimate
node scripts/calc.js pm --canton ZG --profit 500000      # → 59 250.00 CHF (11.85 %)
node scripts/calc.js compare --cantons ZH,ZG,GE,VD,TI --profit 500000

# Article 10 LTVA threshold
node scripts/calc.js vat-threshold --turnover 95000      # → not subject

# Property transfer duty
node scripts/calc.js mutation --canton GE --price 1200000

# Pro-rata, AHV contributions, BVG coordination deduction…
node scripts/calc.js --help
```

Output is JSON for piping into skills.

---

## Integrations

| Connector | Description | Required env |
|-----------|-------------|--------------|
| [bexio](integrations/bexio) | Swiss SME accounting, transactions, contacts | `BEXIO_API_TOKEN` |
| [Stripe](integrations/stripe) | Charges, payouts, fees (CHF / EUR / USD) | `STRIPE_SECRET` |
| [PostFinance](integrations/postfinance) | ISO 20022 camt.053 statement parser (works offline) | none |

```bash
npm run fetch:bexio
npm run fetch:stripe -- --start 2026-01-01
node integrations/postfinance/parse.js statement.xml > transactions.json
```

See [`integrations/README.md`](./integrations/README.md) and [`.env.example`](./.env.example).

---

## Evals

The repo ships an LLM-as-judge eval framework, modelled on `romainsimon/paperasse`. Skills are run with and without their SKILL.md, then graded for accuracy, citation of correct legal basis (CO / LIFD / LTVA / CC), and absence of French-only references (CGI, DGFIP, BOFiP).

```bash
uv run --project evals python evals/run_evals.py                           # all skills
uv run --project evals python evals/run_evals.py --skill fiduciaire        # one
uv run --project evals python evals/run_evals.py --changed-only            # PR mode
uv run --project evals python evals/aggregate_benchmark.py                 # summary
```

Per-skill cases live in `<skill>/evals/evals.json`; grading prompts in `<skill>/evals/grading.json`.

---

## Project layout

```
.
├── fiduciaire/             # 6 skills, each:
│   ├── SKILL.md            #   English (default — what tools auto-load)
│   ├── SKILL.fr.md         #   French
│   ├── SKILL.de.md         #   German
│   ├── SKILL.it.md         #   Italian
│   ├── references/         #   detailed sub-references (md)
│   ├── data/               #   JSON tables, rates, schedules
│   ├── templates/          #   document templates
│   ├── scripts/            #   skill-specific helpers
│   └── evals/              #   eval cases + grading
├── expert-fiscal/  controleur-afc/  reviseur-agree/  notaire-cantonal/  regie/
├── data/
│   └── cantons/            # 26 cantonal JSON files (single source of truth)
├── evals/                  # cross-skill eval runner (uv)
│   ├── pyproject.toml
│   ├── run_evals.py
│   ├── aggregate_benchmark.py
│   └── config.yaml
├── integrations/           # bexio / Stripe / PostFinance connectors (Node.js)
├── scripts/                # calc.js, qr-bill generator, deterministic helpers
├── templates/              # cross-skill templates
├── company.example.json    # context input for skills
├── marketplace.json        # skill registry metadata
├── package.json            # Node deps
└── .env.example
```

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Priorities: refine cantonal tax data, translate skill content, add eval cases, build templates (Swiss VAT-compliant invoice, VD/GE lease, official rent-increase form).

All contributions MIT-licensed.

---

## ⚠️ Disclaimer

These skills are **assistance tools**. They do not replace a qualified Treuhänder, certified tax expert, FAOA-licensed auditor, notary, or attorney. Tax rates evolve yearly — verify against official sources (ESTV, FTA, BAZG, cantonal authorities) before any binding decision.

---

## Official sources

- [Federal Tax Administration (FTA / ESTV)](https://www.estv.admin.ch)
- [Fedlex — Classified Compilation of Federal Legislation](https://www.fedlex.admin.ch)
- [Swiss Tax Conference (STC / SSK)](https://www.steuerkonferenz.ch)
- [Federal Audit Oversight Authority (FAOA / RAB)](https://www.rab-asr.ch)
- [Swiss Notaries Federation](https://www.notaires.ch)
- [Federal Office for Housing — Reference rate](https://www.bwo.admin.ch)
