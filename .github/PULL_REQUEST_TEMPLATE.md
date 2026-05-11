# Pull Request

## Summary

<!-- One or two sentences. What changes and why. -->

## Type

- [ ] Skill content (SKILL.md prompt / instruction edits)
- [ ] Canton data (`data/cantons/*.json`, barème, valeur locative, etc.)
- [ ] Template (`*/templates/*.md`, root `templates/`)
- [ ] Script / validator (`scripts/`, per-skill `scripts/`)
- [ ] Docs (README, CONTRIBUTING, references, examples)
- [ ] Bugfix
- [ ] Eval case (`*/evals/*.json`, `evals/files/`)
- [ ] Other:

## Canton(s) Affected

<!-- e.g. ZH, GE, VD, all 26, federal-only. Use ISO codes. -->

## Sources Cited

<!-- Primary sources: admin.ch (LIFD/LTVA/CO/CC), estv.admin.ch, canton AFC, ZEFIX, BNS, OFL.
     Paste URLs and access date. Sample/illustrative values must keep `_disclaimer` and `_source` fields. -->

## Eval Impact

- [ ] No eval change expected
- [ ] Adds new eval case(s) — listed below
- [ ] Changes existing eval grading — justified below

<!-- If touching calc or skill prompts: ran `python evals/run_evals.py` locally? Pre/post pass rate? -->

## Quadrilingual Sync

FR is canonical. EN/DE/IT must stay parallel.

- [ ] `README.md` (EN) ↔ `README.fr.md` ↔ `README.de.md` ↔ `README.it.md`
- [ ] `CONTRIBUTING.md` (EN) ↔ `CONTRIBUTING.fr.md` ↔ `CONTRIBUTING.de.md` ↔ `CONTRIBUTING.it.md`
- [ ] `<skill>/SKILL.md` ↔ `SKILL.fr.md` ↔ `SKILL.de.md` ↔ `SKILL.it.md`
- [ ] N/A — change is monolingual (data, scripts, eval files, etc.)

## Checklist

- [ ] Self-reviewed the diff
- [ ] No personal contact info or secrets in committed files
- [ ] JSON / XML files validate
- [ ] Sample numeric data flagged with `_disclaimer` + `_source`
