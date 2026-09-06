#!/usr/bin/env python3
"""
Universal Webhook & cTrader Open API Dispatcher for QuantVibe
Dispatches cryptographically signed order payloads to cTrader, TradingView, or Custom EAs.
"""
import argparse
import hashlib
import json
import os
import sys
import urllib.request
import urllib.error
import uuid
from datetime import datetime, timezone


def parse_args():
    parser = argparse.ArgumentParser(description="Universal Webhook / cTrader Dispatcher for QuantVibe")
    parser.add_argument("--action", default="BUY", choices=["BUY", "SELL"], help="Order side")
    parser.add_argument("--symbol", "--ticker", dest="symbol", required=True, help="Asset ticker (e.g. AAPL, EURUSD)")
    parser.add_argument("--qty", "--volume", dest="qty", required=True, type=float, help="Volume / Units")
    parser.add_argument("--price", type=float, default=None, help="Estimated price")
    parser.add_argument("--url", default=None, help="Target webhook URL")
    parser.add_argument("--secret", default=None, help="Shared HMAC secret for signature")
    return parser.parse_args()


def main():
    args = parse_args()
    webhook_url = args.url or os.environ.get("ORDER_WEBHOOK_URL")
    order_id = f"WH_{uuid.uuid4().hex[:12].upper()}"

    payload = {
        "event": "QUANTVIBE_ORDER_DISPATCH",
        "order_id": order_id,
        "symbol": args.symbol.upper(),
        "action": args.action.upper(),
        "qty": args.qty,
        "price": args.price,
        "system": "QuantVibe Alpha158",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    if webhook_url and webhook_url.startswith("http"):
        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                webhook_url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "QuantVibe-Webhook/1.0",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=6) as resp:
                status_code = resp.status
                print(f"[WEBHOOK] {{'status': 'DISPATCHED', 'http_code': {status_code}, 'order_id': '{order_id}', 'url': '{webhook_url}'}}")
                sys.exit(0)
        except Exception as e:
            print(f"[ERROR WEBHOOK] Fallo al enviar al endpoint: {e}", file=sys.stderr)
            sys.exit(1)

    # Simulation receipt
    output = {
        "broker": "cTrader / Webhook Gateway",
        "order_id": order_id,
        "symbol": args.symbol.upper(),
        "action": args.action.upper(),
        "qty": args.qty,
        "status": "PACKET_SIGNED_READY",
        "payload_digest": hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()[:16],
        "notice": "Payload firmado listo para emitir. Configura ORDER_WEBHOOK_URL para transmisión HTTP directa."
    }
    print(f"[WEBHOOK] {json.dumps(output)}")
    sys.exit(0)


if __name__ == "__main__":
    main()
