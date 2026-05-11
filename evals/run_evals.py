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
import datetime as _dt
import hashlib
import json
import os
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

import yaml

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent

GIT_TIMEOUT = 10
LLM_TIMEOUT = 900  # 15 min per call

ALLOWED_ENV_KEYS = {"ANTHROPIC_API_KEY", "OPENAI_API_KEY", "MISTRAL_API_KEY"}

# --- Live LLM provider config ------------------------------------------
PROVIDERS = {
    "anthropic": {
        "url": "https://api.anthropic.com/v1/messages",
        "model": "claude-haiku-4-5",
        "env": "ANTHROPIC_API_KEY",
    },
    "openai": {
        "url": "https://api.openai.com/v1/chat/completions",
        "model": "gpt-4o-mini",
        "env": "OPENAI_API_KEY",
    },
    "mistral": {
        "url": "https://api.mistral.ai/v1/chat/completions",
        "model": "mistral-small-latest",
        "env": "MISTRAL_API_KEY",
    },
}

HTTP_TIMEOUT = 120


def _http_post(url: str, headers: dict[str, str], payload: dict[str, Any]) -> dict[str, Any]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8"))


def llm_chat(provider: str, system: str, user: str) -> str:
    """Call provider with a system + user message. Returns assistant text."""
    cfg = PROVIDERS[provider]
    api_key = os.environ.get(cfg["env"], "")
    if not api_key:
        raise RuntimeError(f"missing env var {cfg['env']} for provider {provider}")
    if provider == "anthropic":
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": cfg["model"],
            "max_tokens": 1024,
            "system": system,
            "messages": [{"role": "user", "content": user}],
        }
        resp = _http_post(cfg["url"], headers, payload)
        parts = resp.get("content", [])
        return "".join(p.get("text", "") for p in parts if p.get("type") == "text")
    # OpenAI-compatible (openai, mistral)
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": cfg["model"],
        "max_tokens": 1024,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    resp = _http_post(cfg["url"], headers, payload)
    return resp["choices"][0]["message"]["content"]


def llm_judge(provider: str, case: dict[str, Any], response: str) -> dict[str, Any]:
    """LLM-as-judge: returns dict with int score 0-100 and pass bool."""
    themes = case.get("expected_themes", [])
    must = case.get("must_cite", [])
    forb = case.get("must_not_cite", [])
    system = (
        "You are a strict grading judge. Score the candidate response 0-100 "
        "against the rubric. Reply with ONLY a JSON object like "
        '{"score": <int 0-100>, "rationale": "<short>"} — no prose, no fences.'
    )
    user = json.dumps({
        "question": case.get("input", ""),
        "expected_themes": themes,
        "must_cite": must,
        "must_not_cite": forb,
        "candidate_response": response[:4000],
    }, ensure_ascii=False)
    try:
        raw = llm_chat(provider, system, user)
    except Exception as e:  # noqa: BLE001
        return {"score": 0, "passed": False, "error": str(e)}
    raw = raw.strip()
    # Strip code fences if any
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[4:]
    # Find first {...}
    start = raw.find("{")
    end = raw.rfind("}")
    if start >= 0 and end > start:
        try:
            obj = json.loads(raw[start : end + 1])
            score = int(obj.get("score", 0))
            return {"score": score, "passed": score >= 70, "rationale": obj.get("rationale", "")}
        except (ValueError, TypeError):
            pass
    return {"score": 0, "passed": False, "error": "unparseable judge response", "raw": raw[:200]}


def _load_skill_system_prompt(skill_dir: Path) -> str:
    f = skill_dir / "SKILL.md"
    if not f.exists():
        return ""
    return f.read_text(encoding="utf-8")


def run_live(cfg: dict[str, Any], selected: list[str], provider: str,
             max_cases: int | None, run_root: Path) -> int:
    if provider not in PROVIDERS:
        print(f"error: unknown provider {provider}", file=sys.stderr)
        return 2
    pcfg = PROVIDERS[provider]
    if not os.environ.get(pcfg["env"]):
        print(f"error: env var {pcfg['env']} not set", file=sys.stderr)
        return 2

    run_root.mkdir(parents=True, exist_ok=True)
    report: dict[str, Any] = {
        "provider": provider,
        "model": pcfg["model"],
        "timestamp": _dt.datetime.utcnow().isoformat() + "Z",
        "skills": {},
    }
    total_with: list[int] = []
    total_without: list[int] = []

    for skill in selected:
        skill_dir = REPO_ROOT / cfg["skills"][skill]["path"]
        cases = load_skill_cases(skill_dir)
        if not cases:
            continue
        if max_cases is not None:
            cases = cases[:max_cases]
        skill_system = _load_skill_system_prompt(skill_dir)
        baseline_system = cfg["skills"][skill].get("baseline_prompt", "You are a helpful assistant.")
        per_case: list[dict[str, Any]] = []
        for case in cases:
            try:
                resp_without = llm_chat(provider, baseline_system, case["input"])
            except Exception as e:  # noqa: BLE001
                resp_without = f"[error: {e}]"
            try:
                resp_with = llm_chat(provider, skill_system or baseline_system, case["input"])
            except Exception as e:  # noqa: BLE001
                resp_with = f"[error: {e}]"
            judge_without = llm_judge(provider, case, resp_without)
            judge_with = llm_judge(provider, case, resp_with)
            per_case.append({
                "case_id": case["id"],
                "without_skill": judge_without,
                "with_skill": judge_with,
                "delta": judge_with.get("score", 0) - judge_without.get("score", 0),
            })
            total_with.append(judge_with.get("score", 0))
            total_without.append(judge_without.get("score", 0))
            tprint(f"  [live] {skill}/{case['id']}  with={judge_with.get('score',0)}  "
                   f"without={judge_without.get('score',0)}")
        mean_with = sum(r["with_skill"].get("score", 0) for r in per_case) / max(len(per_case), 1)
        mean_without = sum(r["without_skill"].get("score", 0) for r in per_case) / max(len(per_case), 1)
        passed_with = sum(1 for r in per_case if r["with_skill"].get("passed"))
        passed_without = sum(1 for r in per_case if r["without_skill"].get("passed"))
        report["skills"][skill] = {
            "cases": per_case,
            "mean_with": round(mean_with, 2),
            "mean_without": round(mean_without, 2),
            "delta": round(mean_with - mean_without, 2),
            "passed_with": passed_with,
            "passed_without": passed_without,
            "total": len(per_case),
        }

    ts = _dt.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    out_file = run_root / f"{provider}-{ts}.json"
    out_file.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    # Markdown summary
    print()
    print(f"### Live eval — provider={provider} model={pcfg['model']}")
    print()
    print("| Skill | With | Without | Δ | Pass (w/wo) |")
    print("|-------|------|---------|---|-------------|")
    for skill, s in sorted(report["skills"].items()):
        print(f"| {skill} | {s['mean_with']:.1f} | {s['mean_without']:.1f} | "
              f"{s['delta']:+.1f} | {s['passed_with']}/{s['total']} - {s['passed_without']}/{s['total']} |")
    if total_with:
        mw = sum(total_with) / len(total_with)
        mwo = sum(total_without) / len(total_without)
        print(f"| **OVERALL** | {mw:.1f} | {mwo:.1f} | {mw-mwo:+.1f} | |")
    print()
    print(f"Report: {out_file}")
    return 0


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
    ap.add_argument("--mode", choices=["stub", "live"], default="stub",
                    help="stub: offline substring grading (default). live: real LLM calls.")
    ap.add_argument("--provider", choices=list(PROVIDERS.keys()), default="anthropic",
                    help="LLM provider for --mode=live")
    ap.add_argument("--max-cases", type=int, default=None,
                    help="Cap cases per skill (live mode)")
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

    if args.mode == "live":
        results_dir = SCRIPT_DIR / "results"
        results_dir.mkdir(parents=True, exist_ok=True)
        return run_live(cfg, selected, args.provider, args.max_cases, results_dir)

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
