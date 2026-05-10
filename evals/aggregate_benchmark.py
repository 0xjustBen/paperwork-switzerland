"""Aggregate per-skill grading into a single summary table.

Reads evals/runs/benchmark.json and prints a human-readable table.

Usage:
  uv run --project evals python evals/aggregate_benchmark.py
  uv run --project evals python evals/aggregate_benchmark.py --json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--bench", default="evals/runs/benchmark.json")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)

    p = Path(args.bench)
    if not p.exists():
        print(f"error: {p} not found. Run run_evals.py first.", file=sys.stderr)
        return 1

    bench = json.loads(p.read_text(encoding="utf-8"))
    skills = bench.get("skills", {})

    if args.json:
        print(json.dumps(bench, indent=2))
        return 0

    print(f"{'Skill':<22} {'With':>7} {'Without':>9} {'Δ':>7}  Pass with/without")
    print("-" * 70)
    total_with, total_without, n = 0.0, 0.0, 0
    for skill, s in sorted(skills.items()):
        w = s["with_skill"]["avg_score"]
        wo = s["without_skill"]["avg_score"]
        d = s["delta"]
        pw = f"{s['with_skill']['passed']}/{s['with_skill']['total']}"
        pwo = f"{s['without_skill']['passed']}/{s['without_skill']['total']}"
        print(f"{skill:<22} {w:>7.2f} {wo:>9.2f} {d:>+7.2f}  {pw} / {pwo}")
        total_with += w; total_without += wo; n += 1
    if n:
        print("-" * 70)
        print(f"{'AVERAGE':<22} {total_with/n:>7.2f} {total_without/n:>9.2f} "
              f"{(total_with - total_without)/n:>+7.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
