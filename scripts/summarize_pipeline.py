#!/usr/bin/env python3
"""
Summarize quantitative pipeline execution results for GitHub Actions or CLI output.
"""

from __future__ import annotations

import json
import os
import sys

# Ensure UTF-8 output even on legacy Windows terminals
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def summarize(project_root: str = ".") -> None:
    eval_path = os.path.join(project_root, "artifacts", "evaluation.json")
    signals_path = os.path.join(project_root, "artifacts", "signals.json")
    orders_path = os.path.join(project_root, "artifacts", "orders_plan.json")

    eval_data = {}
    signals_data = {}
    orders_data = {}

    if os.path.exists(eval_path):
        with open(eval_path, "r", encoding="utf-8") as f:
            eval_data = json.load(f)

    if os.path.exists(signals_path):
        with open(signals_path, "r", encoding="utf-8") as f:
            signals_data = json.load(f)

    if os.path.exists(orders_path):
        with open(orders_path, "r", encoding="utf-8") as f:
            orders_data = json.load(f)

    # Metrics
    mean_ic = eval_data.get("mean_ic", 0.0)
    icir = eval_data.get("icir", 0.0)
    hit_rate = eval_data.get("hit_rate_topk", 0.0)
    avg_topk = eval_data.get("avg_topk_fwd_return", 0.0)
    passed = eval_data.get("passed", False)
    verdict = "APROBADO" if passed else "REVISAR"

    # Signals
    signals_list = signals_data.get("signals", [])
    model_name = signals_data.get("source_model", "QuantModel")

    # Orders
    orders_list = orders_data.get("orders", [])
    dry_run = orders_data.get("dry_run", True)

    print("=" * 60)
    print(f"QUANT PIPELINE SUMMARY | Model: {model_name} | Verdict: {verdict}")
    print(f"IC: {mean_ic:+.4f} | ICIR: {icir:+.4f} | Hit-Rate Top-K: {hit_rate * 100:.1f}%")
    print(f"Signals: {len(signals_list)} | Orders Planned: {len(orders_list)} (dry_run={dry_run})")
    print("=" * 60)

    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        try:
            with open(summary_file, "a", encoding="utf-8") as f:
                f.write("## 📈 Daily Quant Pipeline Execution Summary\n\n")
                verdict_badge = "🟢 APROBADO" if passed else "🟡 RECHAZADO"
                f.write(f"**Model:** `{model_name}` | **Backtest Gate:** {verdict_badge}  \n\n")

                f.write("| Metric | Value | Description |\n")
                f.write("|---|:---:|---|\n")
                f.write(f"| **Mean IC** | `{mean_ic:+.4f}` | Rank correlation with 1-day future return |\n")
                f.write(f"| **ICIR** | `{icir:+.4f}` | Information Coefficient Information Ratio |\n")
                f.write(f"| **Hit-Rate Top-K** | `{hit_rate * 100:.1f}%` | Percentage of top signals beating universe median |\n")
                f.write(f"| **Top-K Return** | `{avg_topk * 100:+.3f}%` | Average return of selected top assets |\n\n")

                f.write("### 🎯 Alpha Top Ranked Assets\n\n")
                f.write("| Rank | Ticker | Alpha Score |\n")
                f.write("|:---:|:---:|:---:|\n")
                for s in signals_list[:5]:
                    f.write(f"| #{s.get('rank')} | **{s.get('instrument')}** | `{s.get('score', 0):+.4f}` |\n")
                f.write("\n")

                f.write("### 📋 Generated Paper Orders\n\n")
                f.write(f"**Dry Run:** `{dry_run}` | **Total Planned:** `{len(orders_list)}`  \n\n")
                f.write("| Action | Symbol | Qty | Est. Price | Est. Notional |\n")
                f.write("|:---:|:---:|:---:|:---:|:---:|\n")
                for o in orders_list:
                    action = o.get("action", "BUY")
                    sym = o.get("instrument", o.get("broker_symbol", ""))
                    qty = o.get("qty", 0)
                    price = o.get("est_price", 0.0)
                    notional = o.get("est_notional", qty * price)
                    f.write(f"| `{action}` | **{sym}** | `{qty}` | ~${price:.2f} | ~${notional:,.2f} |\n")
                f.write("\n")
        except Exception as err:
            print(f"Failed to write GITHUB_STEP_SUMMARY: {err}")


def main() -> None:
    summarize(".")


if __name__ == "__main__":
    main()
