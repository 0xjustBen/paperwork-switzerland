#!/usr/bin/env python3
"""update_data.py — Refresh AFC/ESTV source URLs and ping each for liveness.

Reads data/sources.json (an array or object of {name, url, ...}) and logs an HTTP HEAD
status for each entry. Writes back to data/sources.json with `lastChecked` and `lastStatus`.

Legal/context: sources include ESTV (Administration fédérale des contributions),
AFC cantonal portals, ZEFIX, SECO, FINMA, OFAS. No legal binding — informational only.

External deps: `requests` (only).
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path
from typing import Any

try:
    import requests  # type: ignore
except ImportError:  # pragma: no cover
    requests = None  # type: ignore


def ping(url: str, timeout: float = 10.0) -> tuple[int | None, str | None]:
    if requests is None:
        return None, "requests-not-installed"
    try:
        r = requests.head(url, timeout=timeout, allow_redirects=True)
        if r.status_code >= 400:
            r = requests.get(url, timeout=timeout, allow_redirects=True, stream=True)
        return r.status_code, None
    except Exception as exc:  # noqa: BLE001
        return None, str(exc)


def update(sources_path: Path, dry_run: bool = False) -> dict[str, Any]:
    data = json.loads(sources_path.read_text(encoding="utf-8"))
    items = data if isinstance(data, list) else data.get("sources", [])
    now = dt.datetime.now(dt.timezone.utc).isoformat()
    summary = {"ok": 0, "fail": 0, "total": len(items)}
    for item in items:
        url = item.get("url")
        if not url:
            continue
        status, err = ping(url)
        item["lastChecked"] = now
        item["lastStatus"] = status
        if err:
            item["lastError"] = err
            summary["fail"] += 1
        else:
            item.pop("lastError", None)
            if status and status < 400:
                summary["ok"] += 1
            else:
                summary["fail"] += 1
        print(f"[{status or 'ERR'}] {item.get('name','?')}: {url}", file=sys.stderr)
    if not dry_run:
        sources_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return summary


def main() -> int:
    p = argparse.ArgumentParser(description="Refresh & ping AFC/ESTV source URLs in data/sources.json.")
    p.add_argument("--file", type=Path, default=Path("data/sources.json"))
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()
    if not args.file.exists():
        print(f"error: {args.file} not found", file=sys.stderr)
        return 2
    summary = update(args.file, dry_run=args.dry_run)
    json.dump(summary, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if summary["fail"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
