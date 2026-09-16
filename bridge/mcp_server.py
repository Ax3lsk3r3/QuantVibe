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
    host=os.environ.get("QVB_MCP_HOST", "127.0.0.1"),
    port=int(os.environ.get("QVB_MCP_PORT", "8000")),
)


def _load() -> Dict[str, Any]:
    return load_signals(SIGNALS_PATH)


def get_latest_signals(top_n: int = 0) -> Dict[str, Any]:
    """Retrieve the latest quantitative stock selection signals produced by the Qlib ML pipeline.

    Use this tool before making any trading or allocation decisions. Signals are ranked
    cross-sectionally with higher scores indicating higher predicted relative returns.

    Parameters:
        top_n: Number of top-ranked instruments to return. Default is 0, which returns
               all ranked instruments in the universe. Must be >= 0.

    Returns:
        A dictionary containing:
        - as_of: Effective date of the signals (YYYY-MM-DD).
        - generated_at: UTC timestamp when the signals were generated.
        - source_model: Name of the model architecture (e.g. LightGBM, Alpha158).
        - data_source: Underlying market data feed.
        - horizon_days: Prediction horizon in trading days.
        - checksum: SHA-256 integrity checksum of the signals payload.
        - signals: List of ranked instruments with rank (1..N), symbol, and score.
    """
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
    """List all stock tickers tracked by the quantitative research and signal generation pipeline.

    Use this tool to inspect the active universe of assets covered by QuantVibe before querying
    specific signals or checking market coverage.

    Returns:
        A dictionary containing:
        - universe: Sorted list of ticker symbols (e.g. ['AAPL', 'MSFT', 'NVDA']).
        - count: Total number of instruments in the universe.
        - as_of: Effective date of the asset universe configuration (YYYY-MM-DD).
    """
    payload = _load()
    return {
        "universe": payload["universe"],
        "count": len(payload["universe"]),
        "as_of": payload["as_of"],
    }


def signal_health(max_age_hours: float = 24.0) -> Dict[str, Any]:
    """Check the health, integrity, and staleness of the quantitative signals artifact.

    Use this tool for system monitoring and sanity checks before consuming signals in automated workflows.
    Verifies that the signals file exists, the SHA-256 checksum is valid, and the data is within acceptable age.

    Parameters:
        max_age_hours: Maximum allowable signal age in hours before considering data stale.
                       Default is 24.0 hours.

    Returns:
        A dictionary containing:
        - ok: Boolean indicating if the signals file is healthy and fresh.
        - age_hours: Current age of the signals in hours since generation.
        - max_age_hours: The freshness threshold applied.
        - path: Path to the signals file on disk.
        - source_model: Model that generated the signals.
        - n_signals: Number of valid signals in the payload.
        - as_of: Market date of the signals.
    """
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
    transport = os.environ.get("QVB_MCP_TRANSPORT", "stdio").strip().lower()
    if transport in ("sse", "streamable-http", "http"):
        mcp.run(transport="sse" if transport == "sse" else "streamable-http")
    else:
        mcp.run()
