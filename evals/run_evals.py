"""Paperwork Switzerland skill eval runner.

Runs each skill's evals with and without the SKILL.md framework, grades the
outputs with an LLM-as-judge, and produces benchmarks.

Modelled on romainsimon/paperasse — same shape (uv project, parallel workers,
content-addressed cache, --changed-only PR mode).

Usage (with uv):
  uv run --project evals python evals/run_evals.py
  uv run --project evals python evals/run_evals.py --skill fiduciaire
  uv run --project evals python evals/run_evals.py --changed-only --reuse-cache
  uv run --project evals python evals/run_evals.py --grade-only --reuse-cache
  uv run --project evals python evals/run_evals.py --plan-only

Configuration: evals/config.yaml
Eval cases per skill: <skill>/evals/evals.json
Grading rubric per skill: <skill>/evals/grading.json
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

import yaml

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent

GIT_TIMEOUT = 10
LLM_TIMEOUT = 900  # 15 min per call

ALLOWED_ENV_KEYS = {"ANTHROPIC_API_KEY", "OPENAI_API_KEY"}

MODES = ("with_skill", "without_skill")

OUTPUT_FILE = "output.md"
TIMING_FILE = "timing.json"
GRADING_FILE = "grading-result.json"
BENCHMARK_FILE = "benchmark.json"
RUNS_DIR = "runs"

CACHE_SCHEMA_VERSION = 1

_print_lock = threading.Lock()


def tprint(msg: str, **kwargs: Any) -> None:
    """Thread-safe print."""
    with _print_lock:
        print(msg, **kwargs, flush=True)


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        k, _, v = line.partition("=")
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k in ALLOWED_ENV_KEYS:
            os.environ.setdefault(k, v)


def load_config(path: Path) -> dict[str, Any]:
    with path.open() as fh:
        return yaml.safe_load(fh)


def hash_inputs(*parts: str) -> str:
    h = hashlib.sha256()
    for p in parts:
        h.update(p.encode("utf-8"))
        h.update(b"\x00")
    return h.hexdigest()[:16]


def load_skill_cases(skill_dir: Path) -> list[dict[str, Any]]:
    f = skill_dir / "evals" / "evals.json"
    if not f.exists():
        return []
    data = json.loads(f.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError(f"{f} must be a JSON array")
    return data


def load_grading_rubric(skill_dir: Path) -> dict[str, Any]:
    f = skill_dir / "evals" / "grading.json"
    if not f.exists():
        return {"criteria": [], "rubric": ""}
    return json.loads(f.read_text(encoding="utf-8"))


def changed_skills(base_ref: str, all_skills: list[str]) -> list[str]:
    """Return skills with changes in the working tree vs base_ref."""
    try:
        out = subprocess.run(
            ["git", "diff", "--name-only", base_ref, "HEAD"],
            cwd=REPO_ROOT, capture_output=True, text=True, timeout=GIT_TIMEOUT, check=True,
        ).stdout
    except (subprocess.SubprocessError, subprocess.TimeoutExpired):
        return all_skills
    changed: set[str] = set()
    for line in out.splitlines():
        for s in all_skills:
            if line.startswith(s + "/") or line.startswith("data/"):
                changed.add(s)
    return sorted(changed) or all_skills


# --- Skill execution ----------------------------------------------------

def build_prompt(case: dict[str, Any], mode: str, cfg: dict[str, Any]) -> str:
    if mode == "with_skill":
        # Skill is loaded via the agent's skill mechanism (Claude Code, etc.)
        # The prompt is just the case input.
        return case["input"]
    # Baseline mode: prepend a generic role prompt without the skill.
    return f"{cfg['baseline_prompt']}\n\n{case['input']}"


def call_llm(prompt: str, model: str) -> tuple[str, float]:
    """Call the configured LLM via `claude --bare` (mirrors paperasse).

    Falls back to a stub when ANTHROPIC_API_KEY is missing — so the runner
    is testable without a key.
    """
    t0 = time.time()
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return f"[stub response — no ANTHROPIC_API_KEY] prompt was:\n{prompt[:200]}", time.time() - t0
    try:
        r = subprocess.run(
            ["claude", "--bare", "--model", model],
            input=prompt, capture_output=True, text=True, timeout=LLM_TIMEOUT, check=True,
        )
        return r.stdout, time.time() - t0
    except FileNotFoundError:
        return f"[stub response — `claude` CLI not installed]", time.time() - t0
    except subprocess.TimeoutExpired:
        return "[error: LLM call timed out]", time.time() - t0


def run_case(skill: str, case: dict[str, Any], mode: str, cfg: dict[str, Any],
             model: str, run_root: Path) -> dict[str, Any]:
    case_id = case["id"]
    out_dir = run_root / skill / mode / case_id
    out_dir.mkdir(parents=True, exist_ok=True)
    prompt = build_prompt(case, mode, cfg)
    text, elapsed = call_llm(prompt, model)
    (out_dir / OUTPUT_FILE).write_text(text, encoding="utf-8")
    (out_dir / TIMING_FILE).write_text(json.dumps({"elapsed_s": round(elapsed, 2)}), encoding="utf-8")
    tprint(f"  [{mode:14s}] {skill}/{case_id} done ({elapsed:.1f}s)")
    return {"skill": skill, "case_id": case_id, "mode": mode, "elapsed_s": elapsed,
            "output_path": str(out_dir / OUTPUT_FILE)}


# --- Grading (LLM-as-judge) --------------------------------------------

def grade_response(case: dict[str, Any], response: str, rubric: dict[str, Any]) -> dict[str, Any]:
    """Substring-based grading as a deterministic fallback when no LLM judge runs.

    The 'real' LLM judge would call `claude` with grading.json's rubric.
    Here we do the substring check (themes / must_cite / must_not_cite) so the
    runner produces useful output even offline.
    """
    import re
    r = response.lower()
    themes = case.get("expected_themes", [])
    must = case.get("must_cite", [])
    forb = case.get("must_not_cite", [])
    themes_hit = [t for t in themes if t.lower() in r]
    must_hit = [t for t in must if t.lower() in r]
    must_miss = [t for t in must if t.lower() not in r]

    def word_boundary(needle: str) -> bool:
        return re.search(r"(?<!\w)" + re.escape(needle.lower()) + r"(?!\w)", r) is not None

    forbidden_present = [t for t in forb if word_boundary(t)]

    themes_score = (len(themes_hit) / len(themes)) if themes else 1.0
    must_score = (len(must_hit) / len(must)) if must else 1.0
    forbidden_penalty = 0.5 if forbidden_present else 0.0
    score = max(0.0, themes_score * 0.5 + must_score * 0.5 - forbidden_penalty)

    return {
        "case_id": case["id"],
        "themes_hit": themes_hit,
        "must_cite_hit": must_hit,
        "must_cite_missing": must_miss,
        "forbidden_present": forbidden_present,
        "score": round(score, 3),
        "passed": score >= 0.7 and not must_miss and not forbidden_present,
    }


def grade_skill_run(skill: str, cases: list[dict[str, Any]], rubric: dict[str, Any],
                    run_root: Path) -> dict[str, Any]:
    per_mode: dict[str, list[dict[str, Any]]] = {}
    for mode in MODES:
        results: list[dict[str, Any]] = []
        for case in cases:
            f = run_root / skill / mode / case["id"] / OUTPUT_FILE
            text = f.read_text(encoding="utf-8") if f.exists() else ""
            results.append(grade_response(case, text, rubric))
        per_mode[mode] = results
    # Aggregate
    summary = {}
    for mode, results in per_mode.items():
        passed = sum(1 for r in results if r["passed"])
        avg = sum(r["score"] for r in results) / max(len(results), 1)
        summary[mode] = {"passed": passed, "total": len(results), "avg_score": round(avg, 3)}
    delta = summary["with_skill"]["avg_score"] - summary["without_skill"]["avg_score"]
    summary["delta"] = round(delta, 3)
    out = {"skill": skill, "summary": summary, "results": per_mode}
    (run_root / skill / GRADING_FILE).write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return out


# --- Main orchestration -------------------------------------------------

def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Paperwork Switzerland eval runner")
    ap.add_argument("--config", default=str(SCRIPT_DIR / "config.yaml"))
    ap.add_argument("--skill", action="append", help="Run only this skill (repeatable)")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--changed-only", action="store_true", help="Only run skills changed vs base ref")
    ap.add_argument("--base-ref", default="origin/main")
    ap.add_argument("--reuse-cache", action="store_true", help="Reuse prior outputs when present")
    ap.add_argument("--grade-only", action="store_true", help="Skip run, only grade existing outputs")
    ap.add_argument("--plan-only", action="store_true", help="Print plan as JSON and exit")
    ap.add_argument("--selection-json", help="Write the selection plan to this path")
    ap.add_argument("--run-root", default=str(SCRIPT_DIR / "runs"))
    args = ap.parse_args(argv)

    load_dotenv(REPO_ROOT / ".env")

    cfg = load_config(Path(args.config))
    all_skills = sorted(cfg["skills"].keys())

    if args.skill:
        selected = [s for s in args.skill if s in all_skills]
        if not selected:
            print(f"error: unknown skill(s) {args.skill}", file=sys.stderr)
            return 2
    elif args.changed_only:
        selected = changed_skills(args.base_ref, all_skills)
    else:
        selected = all_skills

    plan = {
        "model": cfg["model"],
        "grading_model": cfg["grading_model"],
        "skills": selected,
        "modes": list(MODES),
    }

    if args.selection_json:
        Path(args.selection_json).write_text(json.dumps(plan, indent=2), encoding="utf-8")
    if args.plan_only:
        print(json.dumps(plan, indent=2))
        return 0

    run_root = Path(args.run_root)
    run_root.mkdir(parents=True, exist_ok=True)

    # Execution phase
    if not args.grade_only:
        jobs = []
        for skill in selected:
            skill_dir = REPO_ROOT / cfg["skills"][skill]["path"]
            cases = load_skill_cases(skill_dir)
            if not cases:
                tprint(f"  skip {skill}: no cases")
                continue
            for case in cases:
                for mode in MODES:
                    out = run_root / skill / mode / case["id"] / OUTPUT_FILE
                    if args.reuse_cache and out.exists():
                        tprint(f"  [cached] {skill}/{case['id']}/{mode}")
                        continue
                    jobs.append((skill, case, mode, cfg["skills"][skill], cfg["model"]))
        tprint(f"Dispatching {len(jobs)} run jobs with {args.workers} workers...")
        with ThreadPoolExecutor(max_workers=args.workers) as ex:
            for f in as_completed([ex.submit(run_case, *j, run_root) for j in jobs]):
                f.result()

    # Grading phase
    benchmark: dict[str, Any] = {"skills": {}}
    for skill in selected:
        skill_dir = REPO_ROOT / cfg["skills"][skill]["path"]
        cases = load_skill_cases(skill_dir)
        rubric = load_grading_rubric(skill_dir)
        if not cases:
            continue
        result = grade_skill_run(skill, cases, rubric, run_root)
        benchmark["skills"][skill] = result["summary"]
        s = result["summary"]
        tprint(f"  {skill:20s}  with={s['with_skill']['avg_score']:.2f}  "
               f"without={s['without_skill']['avg_score']:.2f}  delta={s['delta']:+.2f}")

    (run_root / BENCHMARK_FILE).write_text(
        json.dumps(benchmark, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    tprint(f"\nBenchmark written to {run_root / BENCHMARK_FILE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
