#!/usr/bin/env python3
"""Python parallel of scripts/calc.js — deterministic Swiss tax/accounting calculator.

Same subcommands and numeric outputs as calc.js (must match to centime).
Stdlib only: argparse, json, sys, os.
"""
from __future__ import annotations

import argparse
import json
import os
import sys

VAT_RATES = {"normal": 8.1, "reduced": 2.6, "lodging": 3.8, "exempt": 0.0}
VAT_ALIASES = {
    "standard": "normal", "normale": "normal", "n": "normal",
    "reduit": "reduced", "réduit": "reduced", "ridotta": "reduced",
    "ridotto": "reduced", "r": "reduced",
    "hebergement": "lodging", "hébergement": "lodging",
    "alloggio": "lodging", "beherbergung": "lodging",
}
IFD_EFFECTIVE = 8.5 / 1.085  # ~7.834 %
VAT_THRESHOLD = 100000
AHV_COMBINED_PCT = 10.6
UI_COMBINED_PCT = 2.2
BVG_COORDINATION_2026 = 25725

CANTONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "cantons")


def fail(msg: str) -> None:
    sys.stderr.write(f"error: {msg}\n")
    sys.exit(2)


def round2(n: float) -> float:
    # Match JS Math.round (half away from zero for positive, half toward zero for negative).
    # JS Math.round rounds .5 toward +inf. Python round() uses banker's rounding.
    # Implement JS-like: Math.round(x) === Math.floor(x + 0.5).
    import math
    v = n * 100
    rounded = math.floor(v + 0.5) if v >= 0 else -math.floor(-v + 0.5)
    return rounded / 100


def resolve_rate(value) -> float:
    if value is None:
        return VAT_RATES["normal"]
    try:
        return float(value)
    except (TypeError, ValueError):
        pass
    key = str(value).lower().strip()
    resolved = VAT_ALIASES.get(key, key)
    if resolved not in VAT_RATES:
        fail(f"unknown VAT rate '{value}'")
    return VAT_RATES[resolved]


def parse_number(value, name: str) -> float:
    if value is None:
        fail(f"missing --{name}")
    s = str(value).replace(" ", "").replace("'", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        fail(f"invalid number for --{name}: {value}")


def load_canton(code: str) -> dict:
    if not code:
        fail("missing --canton")
    upper = str(code).upper()
    p = os.path.join(CANTONS_DIR, f"{upper}.json")
    if not os.path.exists(p):
        fail(f"unknown canton '{code}'")
    with open(p, encoding="utf-8") as f:
        return json.load(f)


# --- Commands ---------------------------------------------------------

def cmd_vat(args) -> dict:
    net = parse_number(args.net, "net")
    rate = resolve_rate(args.rate)
    vat = round2(net * rate / 100)
    return {"net": round2(net), "vat": vat, "gross": round2(net + vat), "rate_pct": rate}


def cmd_vat_extract(args) -> dict:
    gross = parse_number(args.gross, "gross")
    rate = resolve_rate(args.rate)
    net = round2(gross / (1 + rate / 100))
    return {"net": net, "vat": round2(gross - net), "gross": round2(gross), "rate_pct": rate}


def cmd_vat_threshold(args) -> dict:
    t = parse_number(args.turnover, "turnover")
    return {
        "turnover": round2(t),
        "threshold": VAT_THRESHOLD,
        "subject_to_vat": t >= VAT_THRESHOLD,
        "headroom": round2(VAT_THRESHOLD - t),
        "legal_basis": "art. 10 LTVA / MWSTG",
    }


def cmd_ifd(args) -> dict:
    profit = parse_number(args.profit, "profit")
    if profit <= 0:
        return {"profit": 0, "ifd_tax": 0, "effective_rate_pct": 0}
    return {
        "profit": round2(profit),
        "effective_rate_pct": round2(IFD_EFFECTIVE),
        "ifd_tax": round2(profit * IFD_EFFECTIVE / 100),
        "legal_basis": "art. 68 LIFD / DBG",
    }


def cmd_pm(args) -> dict:
    profit = parse_number(args.profit, "profit")
    c = load_canton(args.canton)
    rate = c.get("fiscalite", {}).get("taux_pm_effectif_indicatif")
    if rate is None:
        fail(f"no PM rate available for canton {c['code']}")
    tax = round2(profit * rate / 100)
    nom = c.get("nom", {})
    return {
        "canton": c["code"],
        "canton_name": nom.get("fr") or nom.get("de") or nom.get("it"),
        "profit": round2(profit),
        "effective_rate_pct": rate,
        "tax": tax,
        "net_profit": round2(profit - tax),
        "note": "indicative — chef-lieu commune, federal+canton+communal combined",
    }


def cmd_compare(args) -> dict:
    if not args.cantons:
        fail("missing --cantons")
    profit = parse_number(args.profit, "profit")
    codes = [s.strip().upper() for s in str(args.cantons).split(",")]
    rows = []
    for code in codes:
        c = load_canton(code)
        rate = c.get("fiscalite", {}).get("taux_pm_effectif_indicatif")
        tax = round2(profit * rate / 100) if rate is not None else None
        nom = c.get("nom", {})
        rows.append({
            "canton": c["code"],
            "name": nom.get("fr") or nom.get("de") or nom.get("it"),
            "effective_rate_pct": rate,
            "tax": tax,
        })
    rows.sort(key=lambda r: r["effective_rate_pct"] if r["effective_rate_pct"] is not None else 999)
    return {"profit": round2(profit), "rows": rows}


def cmd_mutation(args) -> dict:
    price = parse_number(args.price, "price")
    c = load_canton(args.canton)
    rate = c.get("fiscalite", {}).get("droits_mutation_immo_pct")
    if rate is None:
        fail(f"no mutation rate for canton {c['code']}")
    return {
        "canton": c["code"],
        "price": round2(price),
        "rate_pct": rate,
        "duty": round2(price * rate / 100),
        "note": "cantonal real-estate transfer duty (indicative, varies by commune in some cantons)",
    }


def cmd_ahv(args) -> dict:
    salary = parse_number(args.salary, "salary")
    return {
        "salary": round2(salary),
        "ahv_iv_eo_combined_pct": AHV_COMBINED_PCT,
        "ui_combined_pct": UI_COMBINED_PCT,
        "ahv_iv_eo_amount": round2(salary * AHV_COMBINED_PCT / 100),
        "ui_amount": round2(salary * UI_COMBINED_PCT / 100),
        "employer_share_approx": round2(salary * (AHV_COMBINED_PCT + UI_COMBINED_PCT) / 200),
        "employee_share_approx": round2(salary * (AHV_COMBINED_PCT + UI_COMBINED_PCT) / 200),
        "legal_basis": "LAVS / AHVG, LACI / AVIG",
    }


def cmd_bvg_deduction(args) -> dict:
    salary = parse_number(args.salary, "salary")
    insured = max(0.0, salary - BVG_COORDINATION_2026)
    return {
        "salary": round2(salary),
        "coordination_deduction": BVG_COORDINATION_2026,
        "insured_salary": round2(insured),
        "legal_basis": "art. 8 LPP / BVG",
    }


def cmd_prorata(args) -> dict:
    amount = parse_number(args.amount, "amount")
    days = parse_number(args.days, "days")
    base = parse_number(args.base, "base") if args.base is not None else 365
    return {
        "amount": round2(amount),
        "days": int(days) if days == int(days) else days,
        "base": int(base) if base == int(base) else base,
        "prorata": round2(amount * days / base),
    }


# --- CLI --------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="calc.py",
        description="Swiss deterministic tax/accounting calculator (Python parallel of calc.js).",
    )
    p.add_argument("--pretty", action="store_true", help="Human output instead of JSON")
    sub = p.add_subparsers(dest="command", required=True)

    s = sub.add_parser("vat", help="Compute VAT on a net amount")
    s.add_argument("--net", required=True)
    s.add_argument("--rate", default="normal")

    s = sub.add_parser("vat-extract", help="Extract VAT from a gross amount")
    s.add_argument("--gross", required=True)
    s.add_argument("--rate", default="normal")

    s = sub.add_parser("vat-threshold", help="Check VAT registration threshold")
    s.add_argument("--turnover", required=True)

    s = sub.add_parser("ifd", help="Federal corporate tax (IFD/DBST)")
    s.add_argument("--profit", required=True)

    s = sub.add_parser("pm", help="Combined cantonal corporate tax")
    s.add_argument("--canton", required=True)
    s.add_argument("--profit", required=True)

    s = sub.add_parser("compare", help="Compare PM rates across cantons")
    s.add_argument("--cantons", required=True)
    s.add_argument("--profit", required=True)

    s = sub.add_parser("mutation", help="Real-estate mutation duty")
    s.add_argument("--canton", required=True)
    s.add_argument("--price", required=True)

    s = sub.add_parser("ahv", help="AHV/IV/EO + ALV contributions")
    s.add_argument("--salary", required=True)

    s = sub.add_parser("bvg-deduction", help="BVG coordination deduction / insured salary")
    s.add_argument("--salary", required=True)

    s = sub.add_parser("prorata", help="Pro-rata calculation by days")
    s.add_argument("--amount", required=True)
    s.add_argument("--days", required=True)
    s.add_argument("--base", default=None)

    return p


DISPATCH = {
    "vat": cmd_vat,
    "vat-extract": cmd_vat_extract,
    "vat-threshold": cmd_vat_threshold,
    "ifd": cmd_ifd,
    "pm": cmd_pm,
    "compare": cmd_compare,
    "mutation": cmd_mutation,
    "ahv": cmd_ahv,
    "bvg-deduction": cmd_bvg_deduction,
    "prorata": cmd_prorata,
}


def pretty_print(result: dict) -> None:
    for k, v in result.items():
        if isinstance(v, list):
            print(f"{k}:")
            for row in v:
                print(f"  {json.dumps(row)}")
        else:
            label = k.ljust(22)
            if isinstance(v, (int, float)) and not isinstance(v, bool):
                print(f"  {label} {v:,.2f}".replace(",", "'"))
            else:
                print(f"  {label} {v}")


def main(argv=None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    result = DISPATCH[args.command](args)
    if args.pretty:
        pretty_print(result)
    else:
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
