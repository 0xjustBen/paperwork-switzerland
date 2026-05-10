"""Tests for the eval runner — no LLM call required (stub mode)."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import run_evals  # noqa: E402


REPO_ROOT = Path(__file__).resolve().parents[2]


def test_load_config():
    cfg = run_evals.load_config(REPO_ROOT / "evals" / "config.yaml")
    assert "skills" in cfg
    assert set(cfg["skills"].keys()) >= {
        "fiduciaire", "expert-fiscal", "controleur-afc",
        "reviseur-agree", "notaire-cantonal", "regie",
    }
    assert cfg["model"]
    assert cfg["grading_model"]


def test_load_skill_cases_all_skills_have_cases():
    cfg = run_evals.load_config(REPO_ROOT / "evals" / "config.yaml")
    for skill, scfg in cfg["skills"].items():
        cases = run_evals.load_skill_cases(REPO_ROOT / scfg["path"])
        assert len(cases) >= 1, f"{skill} has no eval cases"
        for c in cases:
            assert "id" in c, f"{skill}: case missing id"
            assert "input" in c, f"{skill}: case {c.get('id')} missing input"
            assert "must_cite" in c, f"{skill}: case {c.get('id')} missing must_cite"


def test_grade_perfect_response():
    case = {
        "id": "x",
        "input": "?",
        "expected_themes": ["foo", "bar"],
        "must_cite": ["LTVA"],
        "must_not_cite": ["CGI"],
    }
    r = run_evals.grade_response(case, "foo bar baz citing LTVA art. 10", {})
    assert r["passed"] is True
    assert r["score"] == 1.0


def test_grade_missing_citation():
    case = {"id": "x", "input": "?", "expected_themes": ["foo"], "must_cite": ["LTVA"], "must_not_cite": []}
    r = run_evals.grade_response(case, "foo only", {})
    assert r["passed"] is False
    assert "LTVA" in r["must_cite_missing"]


def test_grade_forbidden_citation_word_boundary():
    case = {"id": "x", "input": "?", "expected_themes": ["foo"], "must_cite": ["LTVA"], "must_not_cite": ["CGI"]}
    r = run_evals.grade_response(case, "foo with CGI and LTVA", {})
    assert r["passed"] is False
    assert "CGI" in r["forbidden_present"]
    # Word boundary: 'is' should not match 'imposition'
    case2 = {"id": "y", "input": "?", "expected_themes": [], "must_cite": [], "must_not_cite": ["is"]}
    r2 = run_evals.grade_response(case2, "imposition", {})
    assert r2["forbidden_present"] == []


def test_call_llm_stub_mode(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    text, elapsed = run_evals.call_llm("hello", "claude-sonnet-4-6")
    assert "[stub response" in text
    assert elapsed >= 0


def test_main_plan_only(capsys):
    rc = run_evals.main(["--plan-only"])
    assert rc == 0
    out = capsys.readouterr().out
    plan = json.loads(out)
    assert "skills" in plan
    assert plan["modes"] == ["with_skill", "without_skill"]


def test_main_run_and_grade_offline(tmp_path, monkeypatch):
    # Run end-to-end in stub mode — no API key, no `claude` CLI
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    run_root = tmp_path / "runs"
    rc = run_evals.main([
        "--skill", "fiduciaire",
        "--workers", "2",
        "--run-root", str(run_root),
    ])
    assert rc == 0
    benchmark = json.loads((run_root / "benchmark.json").read_text())
    assert "fiduciaire" in benchmark["skills"]
