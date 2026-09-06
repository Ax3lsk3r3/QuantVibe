from __future__ import annotations

import argparse
import json
import os
import shlex
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from bridge.signal_store import load_signals  # noqa: E402

ARTIFACTS = PROJECT_ROOT / "artifacts"
DEFAULT_SIGNALS = ARTIFACTS / "signals.json"


def _price_at(raw_dir: Path, instrument: str, as_of: str) -> float | None:
    csv_path = raw_dir / f"{instrument}.csv"
    if not csv_path.is_file():
        return None
    import csv as _csv

    price = None
    with open(csv_path, "r", newline="", encoding="utf-8") as fh:
        for row in _csv.DictReader(fh):
            if row.get("date", "") <= as_of and row.get("close"):
                price = float(row["close"])
    return price


def build_plan(
    cfg_path: str | None,
    signals_path: Path,
    is_live: bool = False,
    capital_override: float | None = None,
    symbol_suffix: str = "",
    symbol_prefix: str = "",
    fractional: bool = True,
) -> dict:
    from qlib_side.common import load_config

    cfg = load_config(cfg_path)
    payload = load_signals(signals_path)
    as_of = payload["as_of"]
    raw_dir = Path(cfg["data"]["raw_dir"])
    notional = float(capital_override) if capital_override and capital_override > 0 else float(cfg["execution"]["total_notional"])
    action = str(cfg["execution"].get("action", "BUY")).upper()
    n = len(payload["signals"])
    per_name = notional / n if n else 0.0

    orders = []
    for sig in sorted(payload["signals"], key=lambda s: s["rank"]):
        inst = sig["instrument"]
        broker_sym = f"{symbol_prefix}{inst}{symbol_suffix}"
        price = _price_at(raw_dir, inst, as_of)
        entry = {
            "instrument": inst,
            "broker_symbol": broker_sym,
            "action": action,
            "rank": sig["rank"],
            "signal_score": sig["score"],
            "signal_as_of": as_of,
            "signals_checksum": payload.get("checksum"),
        }
        if price is None or price <= 0:
            entry.update({"status": "SKIPPED", "reason": "sin_datos_de_precio"})
            orders.append(entry)
            continue

        raw_qty = per_name / price
        if raw_qty < 0.001:
            entry.update({"status": "SKIPPED", "reason": "capital_insuficiente", "est_price": price})
            orders.append(entry)
            continue

        # If fractional or raw_qty < 1.0, use 2 decimal places (CFD lots / fractional shares)
        if fractional or raw_qty < 1.0:
            qty = round(raw_qty, 2)
            if qty <= 0:
                qty = 0.01  # Minimum lot for MT5 / micro-share
        else:
            qty = int(round(raw_qty))

        entry.update(
            {
                "status": "PLANNED",
                "qty": qty,
                "est_price": price,
                "est_notional": round(qty * price, 2),
            }
        )
        orders.append(entry)

    planned = [o for o in orders if o["status"] == "PLANNED"]
    plan = {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "dry_run": not is_live,
        "currency": cfg["execution"].get("currency", "USD"),
        "total_notional_target": notional,
        "source_model": payload["source_model"],
        "data_source": payload["metadata"].get("data_source"),
        "signals_checksum": payload.get("checksum"),
        "orders": orders,
        "totals": {
            "planned_orders": len(planned),
            "skipped_orders": len(orders) - len(planned),
            "estimated_exposure": round(sum(o["est_notional"] for o in planned), 2),
        },
    }
    return plan


def submit(plan_path: Path, order_cmd_template: str) -> int:
    if os.environ.get("VIBE_ALLOW_ORDERS", "").strip() != "1":
        print(
            "[GUARDIA] El envío real está deshabilitado.\n"
            "         Configura VIBE_ALLOW_ORDERS=1 Y pasa --order-cmd-template para activarlo.\n"
            "         Recomendado: mantén paper trading (cuenta sombra) hasta revisar el plan\n"
            "         a lo largo de varias sesiones.",
            file=sys.stderr,
            flush=True,
        )
        return 2
    with open(plan_path, "r", encoding="utf-8") as fh:
        plan = json.load(fh)
    rc = 0
    planned_orders = [o for o in plan.get("orders", []) if o.get("status") == "PLANNED"]
    total = len(planned_orders)
    print(f"\n[EXEC] Despachando {total} órdenes al conector de ejecución...", flush=True)

    for idx, order in enumerate(planned_orders, start=1):
        target_sym = order.get("broker_symbol") or order["instrument"]
        argv = [
            tok.format(
                symbol=target_sym, qty=order["qty"], est_price=order["est_price"]
            )
            for tok in shlex.split(order_cmd_template, posix=False)
        ]
        cmd_str = " ".join(argv)
        print(f"[ORDEN {idx}/{total}] {cmd_str}", flush=True)
        result = subprocess.run(argv, capture_output=True, text=True)
        if result.stdout.strip():
            print(f"  -> {result.stdout.strip()}", flush=True)
        if result.stderr.strip():
            print(f"  -> [ERROR] {result.stderr.strip()}", file=sys.stderr, flush=True)
        if result.returncode != 0:
            rc = result.returncode

    if rc == 0:
        print(f"\n[OK] {total}/{total} ordenes transmitidas con exito al broker.", flush=True)
    else:
        print(f"\n[AVISO] Una o mas ordenes retornaron codigo distinto de cero (rc={rc}).", file=sys.stderr, flush=True)
    return rc


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convierte señales verificadas de Qlib en un plan de órdenes para el agente Vibe-Trading (paper por defecto)"
    )
    parser.add_argument("--config", default=None)
    parser.add_argument("--signals", default=str(DEFAULT_SIGNALS))
    parser.add_argument("--out", default=str(ARTIFACTS / "orders_plan.json"))
    parser.add_argument("--capital", type=float, default=None, help="Capital total objetivo de la cuenta (ej. 5000, 50000)")
    parser.add_argument("--symbol-suffix", default="", help="Sufijo del broker (ej. .US, .pro, _m)")
    parser.add_argument("--symbol-prefix", default="", help="Prefijo del broker (ej. #)")
    parser.add_argument("--fractional", action="store_true", default=True, help="Permitir lotes / fracciones fraccionarias")
    parser.add_argument(
        "--submit",
        action="store_true",
        help="ejecuta las órdenes vía --order-cmd-template (requiere VIBE_ALLOW_ORDERS=1)",
    )
    parser.add_argument(
        "--order-cmd-template",
        default=None,
        help="plantilla CLI del broker, ej. 'vibe-trading trade buy {symbol} {qty}'",
    )
    args = parser.parse_args()

    signals_path = Path(args.signals)
    if not signals_path.is_absolute():
        signals_path = PROJECT_ROOT / signals_path

    is_live = args.submit and os.environ.get("VIBE_ALLOW_ORDERS", "").strip() == "1"

    try:
        plan = build_plan(
            args.config,
            signals_path,
            is_live=is_live,
            capital_override=args.capital,
            symbol_suffix=args.symbol_suffix,
            symbol_prefix=args.symbol_prefix,
            fractional=args.fractional,
        )
    except FileNotFoundError as exc:
        print(f"[ERROR] {exc}\nEjecuta scripts/run_pipeline.py primero.", file=sys.stderr, flush=True)
        raise SystemExit(1)
    except Exception as exc:
        print(f"[ERROR] no se pudo construir el plan: {exc}", file=sys.stderr, flush=True)
        raise SystemExit(1)

    out_path = Path(args.out)
    if not out_path.is_absolute():
        out_path = PROJECT_ROOT / out_path
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(plan, fh, indent=2)

    print(f"Plan de órdenes ({plan['totals']['planned_orders']} planeadas / "
          f"{plan['totals']['skipped_orders']} omitidas):", flush=True)
    for o in plan["orders"]:
        if o["status"] == "PLANNED":
            print(f"  {o['action']:<4} {o['instrument']:<6} qty={o['qty']:>4} "
                  f"@ ~{o['est_price']:.2f} (rank #{o['rank']})", flush=True)
        else:
            print(f"  SKIP  {o['instrument']:<6} {o['reason']}", flush=True)

    mode_label = "LIVE EXECUTION (dry_run=False)" if is_live else "PAPER SIMULATION (dry_run=True)"
    print(f"\nPlan escrito: {out_path} [{mode_label}]", flush=True)

    if args.submit:
        if not args.order_cmd_template:
            print("[ERROR] --submit requiere --order-cmd-template", file=sys.stderr, flush=True)
            raise SystemExit(2)
        raise SystemExit(submit(out_path, args.order_cmd_template))


if __name__ == "__main__":
    main()
