#!/usr/bin/env python3
"""
QuantVibe Local MetaTrader 5 Bridge
Runs directly on the trader's Windows PC where MetaTrader 5 terminal is active.
Bridges QuantVibe Cloud Web Platform (https://quantvibeapp.com/) with native local MT5.
"""
import argparse
import json
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime


def parse_args():
    parser = argparse.ArgumentParser(description="QuantVibe 1-Click MetaTrader 5 Local Bridge")
    parser.add_argument("--server", default="https://quantvibeapp.com", help="QuantVibe Server URL")
    parser.add_argument("--account", default=None, help="MT5 Account Number (auto-detected if blank)")
    parser.add_argument("--suffix", default="", help="Symbol suffix in broker (e.g. .US, .pro, _m)")
    parser.add_argument("--prefix", default="", help="Symbol prefix in broker (e.g. #)")
    parser.add_argument("--interval", type=float, default=1.5, help="Polling interval in seconds")
    parser.add_argument("--magic", type=int, default=202609, help="QuantVibe Magic Number")
    return parser.parse_args()


def resolve_symbol(mt5, base_symbol: str, prefix: str = "", suffix: str = "") -> str | None:
    # 1. Exact match
    if mt5.symbol_info(base_symbol) is not None:
        mt5.symbol_select(base_symbol, True)
        return base_symbol

    # 2. Custom prefix/suffix
    custom = f"{prefix}{base_symbol}{suffix}"
    if mt5.symbol_info(custom) is not None:
        mt5.symbol_select(custom, True)
        return custom

    # 3. Common broker naming conventions (FTMO, IC Markets, XM, Tickmill)
    candidates = [
        f"{base_symbol}.US",
        f"{base_symbol}.us",
        f"#{base_symbol}",
        f"{base_symbol}_CFD",
        f"{base_symbol}.cfd",
        f"{base_symbol}.pro",
        f"{base_symbol}_m",
        f"{base_symbol}.m",
        f"{base_symbol}.cash",
    ]
    for cand in candidates:
        if mt5.symbol_info(cand) is not None:
            mt5.symbol_select(cand, True)
            return cand

    return None


def normalize_volume(symbol_info, desired_qty: float) -> float:
    min_vol = symbol_info.volume_min
    max_vol = symbol_info.volume_max
    step = symbol_info.volume_step or 0.01

    normalized = round(round(desired_qty / step) * step, 2)
    if normalized < min_vol:
        normalized = min_vol
    if normalized > max_vol:
        normalized = max_vol

    digits = 2
    if step >= 1.0:
        digits = 0
    elif step >= 0.1:
        digits = 1
    return round(normalized, digits)


def get_filling_type(mt5, symbol_info):
    filling_mode = symbol_info.filling_mode
    # SYMBOL_FILLING_FOK = 1, SYMBOL_FILLING_IOC = 2
    if filling_mode & 1:
        return mt5.ORDER_FILLING_FOK
    if filling_mode & 2:
        return mt5.ORDER_FILLING_IOC
    return mt5.ORDER_FILLING_RETURN


def main():
    args = parse_args()
    print("=" * 65)
    print("   QUANTVIBE INSTITUTIONAL ENGINE · MT5 LOCAL DESKTOP BRIDGE")
    print("   https://quantvibeapp.com/ · Conexión Nativa MetaTrader 5")
    print("=" * 65)

    try:
        import MetaTrader5 as mt5
    except ImportError:
        print("[ERROR] El paquete MetaTrader5 no está instalado en este Python.")
        print("        Instálalo ejecutando: pip install MetaTrader5")
        sys.exit(1)

    # Initialize connection to active MT5 terminal on Windows
    print("\n[1/3] Conectando con el terminal MetaTrader 5 abierto en tu PC...")
    if not mt5.initialize():
        print(f"[ERROR] No se pudo inicializar MetaTrader 5: {mt5.last_error()}")
        print("        Asegúrate de que MetaTrader 5 está ABIERTO en tu computadora.")
        sys.exit(1)

    account_info = mt5.account_info()
    if account_info is None:
        print(f"[ERROR] No hay cuenta conectada en MT5: {mt5.last_error()}")
        sys.exit(1)

    account_id = str(args.account or account_info.login)
    terminal_info = mt5.terminal_info()

    print("[2/3] Conexión MT5 Establecida:")
    print(f"      • Cuenta Login : {account_info.login} ({account_info.currency})")
    print(f"      • Broker / Firm: {account_info.company}")
    print(f"      • Servidor MT5 : {account_info.server}")
    print(f"      • Balance Real : ${account_info.balance:,.2f} USD")
    print(f"      • Equidad Libre: ${account_info.equity:,.2f} USD")
    print(f"      • Apalancamiento: 1:{account_info.leverage}")
    print(f"      • Algo Trading : {'ACTIVO (Permitido)' if terminal_info.trade_allowed else 'DESACTIVADO (Activa el botón Algo Trading en MT5)'}")

    print(f"\n[3/3] Enlazando con QuantVibe Cloud Server: {args.server}")
    print("      Escuchando órdenes institucionales en tiempo real... (Ctrl+C para salir)\n")

    last_heartbeat = 0
    poll_count = 0

    while True:
        try:
            now = time.time()
            acc = mt5.account_info()
            balance = acc.balance if acc else 0.0
            equity = acc.equity if acc else 0.0

            # 1. Send Heartbeat every 10 seconds
            if now - last_heartbeat > 10:
                heartbeat_payload = json.dumps({
                    "account": account_id,
                    "broker": acc.company if acc else "Unknown",
                    "server": acc.server if acc else "Unknown",
                    "currency": acc.currency if acc else "USD",
                    "balance": balance,
                    "equity": equity,
                    "leverage": acc.leverage if acc else 100,
                    "algo_trading": terminal_info.trade_allowed if terminal_info else True
                }).encode("utf-8")

                try:
                    hb_req = urllib.request.Request(
                        f"{args.server}/api/mt5/heartbeat",
                        data=heartbeat_payload,
                        headers={"Content-Type": "application/json", "User-Agent": "QuantVibe-Bridge-Python/2.0"},
                        method="POST"
                    )
                    with urllib.request.urlopen(hb_req, timeout=4) as resp:
                        pass
                except Exception:
                    pass
                last_heartbeat = now

            # 2. Poll for pending orders
            poll_url = f"{args.server}/api/mt5/orders?account={account_id}&balance={balance}"
            poll_req = urllib.request.Request(poll_url, headers={"User-Agent": "QuantVibe-Bridge-Python/2.0"})
            with urllib.request.urlopen(poll_req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            orders = data.get("orders", [])
            if orders:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Recibidas {len(orders)} órdenes desde QuantVibe!")

                for ord_item in orders:
                    order_id = ord_item.get("id") or ord_item.get("order_id", "ORD")
                    base_sym = ord_item.get("instrument") or ord_item.get("symbol")
                    action = str(ord_item.get("action", "BUY")).upper()
                    volume = float(ord_item.get("qty", 1))
                    est_price = float(ord_item.get("est_price", 0.0))

                    # Resolve symbol
                    broker_sym = resolve_symbol(mt5, base_sym, args.prefix, args.suffix)
                    if not broker_sym:
                        err_msg = f"Símbolo '{base_sym}' no encontrado en broker MT5. Revisa prefijo/sufijo."
                        print(f"  [RECHAZO] {err_msg}")
                        send_ack(args.server, order_id, account_id, base_sym, "REJECTED", 0, 0, err_msg)
                        continue

                    sym_info = mt5.symbol_info(broker_sym)
                    if not sym_info.visible:
                        mt5.symbol_select(broker_sym, True)

                    final_vol = normalize_volume(sym_info, volume)
                    order_type = mt5.ORDER_TYPE_BUY if action == "BUY" else mt5.ORDER_TYPE_SELL
                    tick = mt5.symbol_info_tick(broker_sym)
                    price = (tick.ask if action == "BUY" else tick.bid) if tick else est_price

                    request = {
                        "action": mt5.TRADE_ACTION_DEAL,
                        "symbol": broker_sym,
                        "volume": final_vol,
                        "type": order_type,
                        "price": price,
                        "deviation": 10,
                        "magic": args.magic,
                        "comment": "QuantVibe Alpha158",
                        "type_time": mt5.ORDER_TIME_GTC,
                        "type_filling": get_filling_type(mt5, sym_info),
                    }

                    result = mt5.order_send(request)
                    if result and result.retcode == mt5.TRADE_RETCODE_DONE:
                        print(f"  [EXITO MT5] {action} {broker_sym} × {final_vol} lotes @ {result.price:.2f} (Ticket #{result.order})")
                        send_ack(args.server, order_id, account_id, broker_sym, "FILLED", result.order, result.price, "Orden ejecutada con éxito")
                    else:
                        ret_comment = result.comment if result else mt5.last_error()
                        ret_code = result.retcode if result else -1
                        print(f"  [ERROR MT5] Fallo al ejecutar {broker_sym}: code={ret_code} ({ret_comment})")
                        send_ack(args.server, order_id, account_id, broker_sym, "REJECTED", 0, 0, f"MT5 retcode={ret_code}: {ret_comment}")

            poll_count += 1
            if poll_count % 20 == 0:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Puente activo · Sincronizado con MT5 ({account_info.company}) · Balance: ${balance:,.2f}")

        except urllib.error.URLError:
            pass
        except KeyboardInterrupt:
            print("\n[QuantVibe] Deteniendo puente local...")
            break
        except Exception as exc:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Aviso puente: {exc}")

        time.sleep(args.interval)

    mt5.shutdown()
    print("[QuantVibe] Conexión cerrada.")


def send_ack(server: str, order_id: str, account: str, symbol: str, status: str, ticket: int, fill_price: float, notes: str):
    try:
        payload = json.dumps({
            "order_id": order_id,
            "account": account,
            "symbol": symbol,
            "status": status,
            "ticket": ticket,
            "fill_price": fill_price,
            "notes": notes
        }).encode("utf-8")
        req = urllib.request.Request(
            f"{server}/api/mt5/ack",
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "QuantVibe-Bridge-Python/2.0"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=4):
            pass
    except Exception:
        pass


if __name__ == "__main__":
    main()
