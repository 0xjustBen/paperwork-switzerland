#!/usr/bin/env python3
"""fetch_zefix.py — Fetch company info from ZEFIX (Swiss central business register).

Legal reference: ORC (RS 221.411) and OBPI / ZefixPublicServices SOAP+REST API,
provided by the Federal Office of Justice. Public JSON endpoint:
    https://www.zefix.admin.ch/ZefixPublicREST/api/v1/company/uid/<UID-without-dashes>

External deps: `requests` (only).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from typing import Any

try:
    import requests  # type: ignore
except ImportError:  # pragma: no cover
    requests = None  # type: ignore

ZEFIX_BASE = "https://www.zefix.admin.ch/ZefixPublicREST/api/v1"


def normalize_uid(uid: str) -> str:
    """Strip non-alphanumeric chars and uppercase; ZEFIX expects CHEXXXXXXXXX."""
    s = re.sub(r"[^A-Za-z0-9]", "", uid).upper()
    if not re.fullmatch(r"CHE\d{9}", s):
        raise ValueError(f"invalid UID: {uid!r}")
    return s


def fetch_zefix(uid: str, timeout: float = 10.0) -> dict[str, Any]:
    """Look up a company by IDE/UID. Returns the parsed JSON payload."""
    if requests is None:
        raise RuntimeError("the 'requests' package is required: pip install requests")
    normalized = normalize_uid(uid)
    url = f"{ZEFIX_BASE}/company/uid/{normalized}"
    resp = requests.get(url, headers={"Accept": "application/json"}, timeout=timeout)
    resp.raise_for_status()
    return resp.json()


def main() -> int:
    p = argparse.ArgumentParser(description="Fetch Swiss company info from ZEFIX by UID.")
    p.add_argument("uid", help="UID/IDE, e.g. CHE-105.962.535 or CHE105962535")
    p.add_argument("--timeout", type=float, default=10.0)
    args = p.parse_args()
    try:
        data = fetch_zefix(args.uid, timeout=args.timeout)
    except Exception as exc:  # noqa: BLE001
        print(f"error: {exc}", file=sys.stderr)
        return 1
    json.dump(data, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
