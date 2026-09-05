#!/usr/bin/env python3
"""
QuantVibe Web Terminal Launcher.
Compatibilidad completa para GitHub Codespaces, desarrollo local y servidores remotos.
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

import socket
import uvicorn


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex(("127.0.0.1", port)) == 0


def main():
    parser = argparse.ArgumentParser(description="Inicia la interfaz Web y API de QuantVibe")
    parser.add_argument(
        "--host",
        default=os.environ.get("HOST", "0.0.0.0"),
        help="Host para enlace (default: 0.0.0.0 para Codespaces y red local)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("PORT", 8001)),
        help="Puerto del servidor (default: 8001)",
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Habilitar recarga en caliente para desarrollo",
    )
    args = parser.parse_args()

    port = args.port
    # If default port 8000 was requested or port is occupied, automatically switch to 8001
    if port == 8000 and is_port_in_use(8000):
        print("\n[AVISO] El puerto 8000 está ocupado por Docker/Cognee. Conmutando a puerto 8001...")
        port = 8001

    print("\n" + "=" * 60)
    print("  [QUANTVIBE TERMINAL] -- Interfaz Web & API")
    print("=" * 60)
    print(f"  * Enlace:             http://{args.host}:{port}")
    print(f"  * Acceso Local / Web: http://localhost:{port}")
    print(f"  * Red IPv4 directa:   http://127.0.0.1:{port}")
    print(f"  * Documentacion API:  http://localhost:{port}/docs")
    print(f"  * Codespaces:         Puerto {port} (Auto-forwarded)")
    print("=" * 60 + "\n")

    uvicorn.run(
        "web.api:app",
        host=args.host,
        port=port,
        reload=args.reload,
        log_level="info",
    )


if __name__ == "__main__":
    main()
