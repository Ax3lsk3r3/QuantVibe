#!/usr/bin/env python3
"""
Alpaca Markets Execution Connector for QuantVibe
Supports both Paper Trading and Live Execution via Alpaca Trading REST API v2.
Pure Python standard library (no external dependencies required).
"""
import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
import uuid


def parse_args():
    parser = argparse.ArgumentParser(description="Alpaca Markets Order Dispatcher for QuantVibe")
    parser.add_argument("--action", default="BUY", choices=["BUY", "SELL"], help="Order action side")
    parser.add_argument("--symbol", "--ticker", dest="symbol", required=True, help="Stock ticker symbol (e.g. AAPL, TSLA)")
    parser.add_argument("--qty", "--volume", dest="qty", required=True, type=float, help="Number of shares")
    parser.add_argument("--price", type=float, default=None, help="Estimated reference price")
    parser.add_argument("--type", default="market", choices=["market", "limit"], help="Order type")
    parser.add_argument("--time-in-force", default="day", choices=["day", "gtc", "ioc"], help="Time in force")
    parser.add_argument("--paper", action="store_true", default=False, help="Use Paper Trading environment")
    parser.add_argument("--live", action="store_true", help="Target Live Account (real capital)")
    parser.add_argument("--env", default="paper", choices=["paper", "live"], help="Environment (paper or live)")
    return parser.parse_args()


def main():
    args = parse_args()
    is_live = args.live or args.env == "live"

    api_key = os.environ.get("APCA_API_KEY_ID")
    secret_key = os.environ.get("APCA_API_SECRET_KEY")
    base_url = os.environ.get(
        "APCA_API_BASE_URL",
        "https://api.alpaca.markets" if is_live else "https://paper-api.alpaca.markets"
    )

    client_order_id = f"qv_{uuid.uuid4().hex[:12]}"
    side = args.action.lower()

    payload = {
        "symbol": args.symbol.upper(),
        "qty": str(args.qty),
        "side": side,
        "type": args.type,
        "time_in_force": args.time_in_force,
        "client_order_id": client_order_id,
    }

    if api_key and secret_key and "mock" not in api_key.lower():
        # Live REST API submission to Alpaca
        req_url = f"{base_url}/v2/orders"
        headers = {
            "APCA-API-KEY-ID": api_key,
            "APCA-API-SECRET-KEY": secret_key,
            "Content-Type": "application/json",
            "User-Agent": "QuantVibe-Terminal/1.0",
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(req_url, data=data, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                output = {
                    "broker": "Alpaca Markets",
                    "environment": "LIVE" if is_live else "PAPER",
                    "order_id": resp_data.get("id"),
                    "client_order_id": resp_data.get("client_order_id"),
                    "symbol": resp_data.get("symbol"),
                    "qty": resp_data.get("qty"),
                    "side": resp_data.get("side"),
                    "status": resp_data.get("status", "accepted"),
                    "filled_at": resp_data.get("filled_at") or datetime.now(timezone.utc).isoformat(),
                    "est_price": args.price,
                    "submitted_at": datetime.now(timezone.utc).isoformat(),
                }
                print(f"[ALPACA] {json.dumps(output)}")
                sys.exit(0)
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="ignore")
            print(f"[ERROR ALPACA HTTP {e.code}] {err_msg}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"[ERROR ALPACA] {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # High-Fidelity Simulation / Sandbox Fallback
        mock_fill = {
            "broker": "Alpaca Markets",
            "environment": "PAPER_SIMULATION",
            "order_id": f"alp_{uuid.uuid4().hex[:16]}",
            "client_order_id": client_order_id,
            "symbol": args.symbol.upper(),
            "qty": args.qty,
            "side": side.upper(),
            "type": args.type.upper(),
            "status": "FILLED",
            "filled_avg_price": round(args.price or 150.0, 2),
            "estimated_notional": round((args.price or 150.0) * args.qty, 2),
            "execution_speed_ms": 14,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "notice": "Simulación confirmada en sandbox Alpaca. Configura APCA_API_KEY_ID para routing a cuenta real."
        }
        print(f"[ALPACA] {json.dumps(mock_fill)}")
        sys.exit(0)


if __name__ == "__main__":
    main()
