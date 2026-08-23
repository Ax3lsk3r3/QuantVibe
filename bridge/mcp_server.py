from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    try:
        from fastmcp import FastMCP
    except ImportError as exc:
        raise ImportError(
            "No se encontró un runtime de servidor MCP. Instala uno de:\n"
            '  pip install "mcp>=1.2,<2"   (SDK oficial, incluye FastMCP)\n'
            "  pip install fastmcp         (FastMCP independiente)"
        ) from exc

from bridge.signal_store import load_signals

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SIGNALS_PATH = Path(os.environ.get("QVB_SIGNALS_PATH", PROJECT_ROOT / "artifacts" / "signals.json"))

mcp = FastMCP(
    "quantvibe-signals",
    instructions=(
        "Acceso read-only a señales de selección de acciones producidas por un modelo ML de Qlib. "
        "Llama get_latest_signals antes de cualquier decisión de trading; los scores son "
        "transversales (mayor es mejor) y se refrescan con cada ejecución del pipeline."
    ),
)


def _load() -> Dict[str, Any]:
    return load_signals(SIGNALS_PATH)


def get_latest_signals(top_n: int = 0) -> Dict[str, Any]:
    """Señales más recientes del modelo: fecha as_of, modelo origen e instrumentos rankeados (top_n=0 para todos)."""
    payload = _load()
    signals: List[Dict[str, Any]] = sorted(payload["signals"], key=lambda s: s["rank"])
    if top_n > 0:
        signals = signals[:top_n]
    return {
        "as_of": payload["as_of"],
        "generated_at": payload["generated_at"],
        "source_model": payload["source_model"],
        "data_source": payload["metadata"].get("data_source"),
        "horizon_days": payload.get("horizon_days", 1),
        "checksum": payload.get("checksum"),
        "signals": [
            {"rank": s["rank"], "instrument": s["instrument"], "score": s["score"]}
            for s in signals
        ],
    }


def list_universe() -> Dict[str, Any]:
    """Instrumentos seguidos por el pipeline de investigación."""
    payload = _load()
    return {
        "universe": payload["universe"],
        "count": len(payload["universe"]),
        "as_of": payload["as_of"],
    }


def signal_health(max_age_hours: float = 24.0) -> Dict[str, Any]:
    """Chequeo de frescura del archivo de señales: existe, checksum válido y edad en horas."""
    result: Dict[str, Any] = {"path": str(SIGNALS_PATH)}
    if not SIGNALS_PATH.is_file():
        result.update({"ok": False, "reason": "missing_file"})
        return result
    try:
        payload = _load()
    except Exception as exc:
        result.update({"ok": False, "reason": f"invalid_signals: {exc}"})
        return result
    generated = datetime.fromisoformat(payload["generated_at"].replace("Z", "+00:00"))
    age_h = (datetime.now(timezone.utc) - generated).total_seconds() / 3600.0
    result.update(
        {
            "ok": age_h <= max_age_hours,
            "age_hours": round(age_h, 3),
            "max_age_hours": max_age_hours,
            "as_of": payload["as_of"],
            "source_model": payload["source_model"],
            "n_signals": len(payload["signals"]),
        }
    )
    return result


mcp.tool()(get_latest_signals)
mcp.tool()(list_universe)
mcp.tool()(signal_health)


if __name__ == "__main__":
    mcp.run()
