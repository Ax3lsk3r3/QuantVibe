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

import uvicorn


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
        default=int(os.environ.get("PORT", 8000)),
        help="Puerto del servidor (default: 8000)",
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Habilitar recarga en caliente para desarrollo",
    )
    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("  [QUANTVIBE TERMINAL] -- Interfaz Web & API")
    print("=" * 60)
    print(f"  * Enlace:             http://{args.host}:{args.port}")
    print(f"  * Acceso Local / Web:  http://localhost:{args.port}")
    print(f"  * Documentacion API:  http://localhost:{args.port}/docs")
    print(f"  * Codespaces:         Puerto {args.port} (Auto-forwarded)")
    print("=" * 60 + "\n")

    uvicorn.run(
        "web.api:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info",
    )


if __name__ == "__main__":
    main()
