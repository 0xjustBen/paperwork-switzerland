#!/usr/bin/env python3
"""generate-vat-return.py — Python parallel of scripts/generate-vat-return.js.

Produces an ESTV/AFC Form 0550 VAT return summary from a bookkeeping JSON array.

Legal reference: LTVA (RS 641.20) art. 36 (méthode effective) and art. 37 (TDFN).
2024+ rates: standard 8.1%, reduced 2.6%, accommodation 3.8%.

External deps: stdlib only.
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any, Literal, TypedDict

Method = Literal["effective", "TDFN"]
Rate = Literal["standard", "reduced", "accommodation", "exempt", "zero"]

STANDARD_RATES: dict[str, float] = {
    "standard": 0.081, "reduced": 0.026, "accommodation": 0.038, "exempt": 0.0, "zero": 0.0,
}


class Entry(TypedDict, total=False):
    date: str
    type: Literal["sale", "purchase"]
    amount: float
    rate: Rate
    vat: float
    deductible: bool
    tdfnRate: float


def _r2(n: float) -> float:
    return round(n, 2)


def generate_vat_return(entries: list[Entry], *, method: Method = "effective",
                        period: str = "", uid: str = "") -> dict[str, Any]:
    ca_total = 0.0
    ca_by_rate = {"standard": 0.0, "reduced": 0.0, "accommodation": 0.0, "exempt": 0.0, "zero": 0.0}
    output_tax = 0.0
    input_tax = 0.0
    tdfn_tax = 0.0

    for e in entries:
        rate = e.get("rate", "standard")
        if e["type"] == "sale":
            amt = float(e.get("amount", 0))
            ca_total += amt
            ca_by_rate[rate] = ca_by_rate.get(rate, 0.0) + amt
            if method == "effective":
                r = STANDARD_RATES.get(rate, 0.0)
                output_tax += float(e["vat"]) if "vat" in e else amt * r
            else:
                tdfn_tax += amt * float(e.get("tdfnRate", 0.0))
        elif e["type"] == "purchase" and method == "effective" and e.get("deductible", True):
            input_tax += float(e.get("vat", 0))

    tax_due = output_tax - input_tax if method == "effective" else tdfn_tax

    return {
        "form": "0550",
        "period": period,
        "uid": uid,
        "method": method,
        "fields": {
            "200_ca_total": _r2(ca_total),
            "220_ca_exempt": _r2(ca_by_rate["exempt"] + ca_by_rate["zero"]),
            "299_ca_imposable": _r2(ca_total - ca_by_rate["exempt"] - ca_by_rate["zero"]),
            "301_ca_taux_normal": _r2(ca_by_rate["standard"]),
            "311_ca_taux_reduit": _r2(ca_by_rate["reduced"]),
            "341_ca_hebergement": _r2(ca_by_rate["accommodation"]),
            "400_impot_brut": _r2(output_tax or tdfn_tax),
            "405_tdfn_impot": _r2(tdfn_tax),
            "500_impot_prealable_mat": _r2(input_tax if method == "effective" else 0.0),
            "900_impot_du": _r2(tax_due),
        },
    }


def main() -> int:
    p = argparse.ArgumentParser(description="Generate ESTV Form 0550 VAT return JSON.")
    p.add_argument("entries_file", help="JSON array of {type, amount, rate, vat?, deductible?, tdfnRate?}")
    p.add_argument("--method", choices=["effective", "TDFN"], default="effective")
    p.add_argument("--period", default="")
    p.add_argument("--uid", default="")
    args = p.parse_args()
    with open(args.entries_file, encoding="utf-8") as fh:
        entries = json.load(fh)
    out = generate_vat_return(entries, method=args.method, period=args.period, uid=args.uid)
    json.dump(out, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
