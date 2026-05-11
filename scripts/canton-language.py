#!/usr/bin/env python3
"""Canton -> language(s) helper (Python parallel of canton-language.js).

Source: Federal Constitution art. 70 — official cantonal languages.
"""
from __future__ import annotations

import json
import sys

CANTON_LANGUAGES: dict[str, list[str]] = {
    "ZH": ["de"], "BE": ["de", "fr"], "LU": ["de"], "UR": ["de"], "SZ": ["de"],
    "OW": ["de"], "NW": ["de"], "GL": ["de"], "ZG": ["de"], "FR": ["fr", "de"],
    "SO": ["de"], "BS": ["de"], "BL": ["de"], "SH": ["de"], "AR": ["de"],
    "AI": ["de"], "SG": ["de"], "GR": ["de", "rm", "it"], "AG": ["de"], "TG": ["de"],
    "TI": ["it"], "VD": ["fr"], "VS": ["fr", "de"], "NE": ["fr"], "GE": ["fr"],
    "JU": ["fr"],
}


def _normalize(canton: str) -> str:
    if not canton:
        raise ValueError("canton code required")
    upper = str(canton).upper().strip()
    if upper not in CANTON_LANGUAGES:
        raise ValueError(f"unknown canton '{canton}'")
    return upper


def languages_for(canton: str) -> list[str]:
    return list(CANTON_LANGUAGES[_normalize(canton)])


def primary_language(canton: str) -> str:
    return CANTON_LANGUAGES[_normalize(canton)][0]


def is_multilingual(canton: str) -> bool:
    return len(CANTON_LANGUAGES[_normalize(canton)]) > 1


def main(argv: list[str]) -> int:
    if len(argv) < 2 or argv[1] in ("--help", "-h"):
        print("Usage: python scripts/canton-language.py <CANTON_CODE>")
        return 0 if len(argv) >= 2 else 1
    code = argv[1]
    try:
        upper = _normalize(code)
    except ValueError as e:
        sys.stderr.write(f"error: {e}\n")
        return 2
    result = {
        "canton": upper,
        "languages": languages_for(upper),
        "primary": primary_language(upper),
        "multilingual": is_multilingual(upper),
    }
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
