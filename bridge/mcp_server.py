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
            "No MCP server runtime found. Install one of:\n"
            '  pip install "mcp>=1.2,<2"   (official SDK, FastMCP bundled)\n'
            "  pip install fastmcp         (standalone FastMCP)"
        ) from exc

from bridge.signal_store import load_signals

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SIGNALS_PATH = Path(os.environ.get("QVB_SIGNALS_PATH", PROJECT_ROOT / "artifacts" / "signals.json"))

mcp = FastMCP(
    "quantvibe-signals",
    instructions=(
        "Read-only access to stock-selection signals produced by a Qlib ML model. "
        "Call get_latest_signals before any trading decision; scores are cross-sectional "
        "(higher is better) and refresh after each pipeline run."
    ),
)


def _load() -> Dict[str, Any]:
    return load_signals(SIGNALS_PATH)


def get_latest_signals(top_n: int = 0) -> Dict[str, Any]:
    """Latest model signals: as_of date, source model and ranked instruments (top_n=0 for all)."""
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
    """Instruments tracked by the research pipeline."""
    payload = _load()
    return {
        "universe": payload["universe"],
        "count": len(payload["universe"]),
        "as_of": payload["as_of"],
    }


def signal_health(max_age_hours: float = 24.0) -> Dict[str, Any]:
    """Freshness check for the signals file: exists, checksum-valid and age in hours."""
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
