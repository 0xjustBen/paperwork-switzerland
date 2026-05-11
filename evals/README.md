# Eval harness

Two execution modes:

## Stub mode (default — offline)

```bash
uv run --project evals python evals/run_evals.py
```

No API calls. Skill outputs are graded by substring matching against
`expected_themes` / `must_cite` / `must_not_cite`. Useful for CI on PRs that
only edit prompts or data — gives a fast deterministic signal.

Results land in `evals/runs/<skill>/...` plus `evals/runs/benchmark.json`.

## Live mode (real LLM-as-judge)

```bash
python evals/run_evals.py --mode=live --provider=anthropic --max-cases=10
python evals/run_evals.py --mode=live --provider=openai
python evals/run_evals.py --mode=live --provider=mistral
```

Two passes per case:
1. **Without skill** — provider answers with only the baseline system prompt
   from `config.yaml`.
2. **With skill** — same model, but the relevant `SKILL.md` is loaded as the
   system prompt.

A second call to the same provider acts as the judge, returning a 0-100 score
against `expected_themes` / `must_cite` / `must_not_cite`. The script
aggregates pass/fail per case, mean score, and the delta
(`with_skill - without_skill`).

Results land in `evals/results/<provider>-<UTC-timestamp>.json` and a markdown
summary table is printed to stdout.

### Required env vars

| Provider | Env var | Model |
|----------|---------|-------|
| anthropic | `ANTHROPIC_API_KEY` | `claude-haiku-4-5` |
| openai | `OPENAI_API_KEY` | `gpt-4o-mini` |
| mistral | `MISTRAL_API_KEY` | `mistral-small-latest` |

### Cost estimate

Each case = 4 LLM calls (2 generations + 2 judge calls). Rough order of
magnitude for 100 cases (~1k input + 1k output tokens each):

| Provider | Model | ~ cost / 100 cases |
|----------|-------|--------------------|
| anthropic | claude-haiku-4-5 | ~ $0.40 |
| openai | gpt-4o-mini | ~ $0.10 |
| mistral | mistral-small-latest | ~ $0.20 |

Use `--max-cases 5` to dry-run cheaply before a full sweep.

## Implementation notes

- Live mode uses only Python stdlib `urllib.request` — no `anthropic` /
  `openai` SDK dependency.
- Stub mode behavior is unchanged from previous releases; `--mode=live` is
  purely additive.
