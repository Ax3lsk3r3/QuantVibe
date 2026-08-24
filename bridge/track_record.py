from __future__ import annotations

import argparse
import csv as _csv
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB = PROJECT_ROOT / "artifacts" / "track_record.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS signals_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    published_at TEXT NOT NULL,
    as_of TEXT NOT NULL,
    instrument TEXT NOT NULL,
    rank INTEGER NOT NULL,
    score REAL NOT NULL,
    source_model TEXT NOT NULL,
    signals_checksum TEXT,
    fwd_return_1d REAL,
    UNIQUE(as_of, instrument, source_model)
);
CREATE TABLE IF NOT EXISTS daily_context (
    as_of TEXT PRIMARY KEY,
    universe_median_fwd REAL
);
CREATE INDEX IF NOT EXISTS idx_log_asof ON signals_log(as_of);
"""


def default_db_path() -> Path:
    return DEFAULT_DB


def _connect(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.executescript(SCHEMA)
    return conn


def log_signals(db_path: Path, payload: Dict[str, Any]) -> int:
    conn = _connect(db_path)
    try:
        cur = conn.execute(
            "SELECT COUNT(*) FROM signals_log WHERE as_of = ? AND source_model = ?",
            (payload["as_of"], payload["source_model"]),
        )
        if cur.fetchone()[0] > 0:
            return 0
        rows = [
            (
                payload["generated_at"],
                payload["as_of"],
                s["instrument"],
                s["rank"],
                float(s["score"]),
                payload["source_model"],
                payload.get("checksum"),
            )
            for s in payload["signals"]
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO signals_log"
            " (published_at, as_of, instrument, rank, score, source_model, signals_checksum)"
            " VALUES (?, ?, ?, ?, ?, ?, ?)",
            rows,
        )
        conn.commit()
        return conn.total_changes
    finally:
        conn.close()


def _close_at(raw_dir: Path, instrument: str, as_of: str, offset: int) -> float | None:
    csv_path = raw_dir / f"{instrument}.csv"
    if not csv_path.is_file():
        return None
    dates: list[str] = []
    closes: list[float] = []
    with open(csv_path, "r", newline="", encoding="utf-8") as fh:
        for row in _csv.DictReader(fh):
            dates.append(row.get("date", ""))
            try:
                closes.append(float(row.get("close", "")))
            except (TypeError, ValueError):
                closes.append(float("nan"))
    if as_of not in dates:
        return None
    i = dates.index(as_of)
    j, k = i + 1, i + 1 + offset
    if k >= len(closes):
        return None
    base, end = closes[j], closes[k]
    if base != base or end != end or base == 0:
        return None
    return end / base - 1.0


def settle(db_path: Path, raw_dir: Path, universe: List[str], horizon: int = 1) -> int:
    conn = _connect(db_path)
    try:
        cur = conn.execute(
            "SELECT DISTINCT as_of FROM signals_log WHERE fwd_return_1d IS NULL ORDER BY as_of"
        )
        pending = [r[0] for r in cur.fetchall()]
        settled = 0
        today = datetime.now(timezone.utc).date().isoformat()
        for as_of in pending:
            if as_of >= today:
                continue
            fwds: Dict[str, float] = {}
            for sym in universe:
                v = _close_at(raw_dir, sym, as_of, horizon)
                if v is not None:
                    fwds[sym] = v
            if len(fwds) < 4:
                continue
            ordered = sorted(fwds.values())
            n = len(ordered)
            median = ordered[n // 2] if n % 2 else (ordered[n // 2 - 1] + ordered[n // 2]) / 2.0
            conn.execute(
                "INSERT OR REPLACE INTO daily_context (as_of, universe_median_fwd) VALUES (?, ?)",
                (as_of, median),
            )
            for sym, v in fwds.items():
                cur2 = conn.execute(
                    "UPDATE signals_log SET fwd_return_1d = ? WHERE as_of = ? AND instrument = ?",
                    (v, as_of, sym),
                )
                settled += cur2.rowcount
            conn.commit()
        return settled
    finally:
        conn.close()


def stats(db_path: Path) -> str:
    conn = _connect(db_path)
    try:
        cur = conn.execute(
            "SELECT source_model,"
            " SUM(CASE WHEN fwd_return_1d IS NOT NULL THEN 1 ELSE 0 END),"
            " COUNT(*),"
            " AVG(fwd_return_1d),"
            " AVG(CASE WHEN fwd_return_1d > 0 THEN 1.0 ELSE 0.0 END)"
            " FROM signals_log GROUP BY source_model"
        )
        lines = ["Track record por modelo:"]
        ctx_cur = conn.execute(
            "SELECT as_of, universe_median_fwd FROM daily_context ORDER BY as_of DESC LIMIT 60"
        )
        medians = {r[0]: r[1] for r in ctx_cur.fetchall()}
        excess_vals: List[float] = []
        for model, settled_n, total, avg_ret, hit in cur.fetchall():
            if not settled_n:
                lines.append(f"  {model}: {total} señales registradas, 0 liquidadas todavía")
                continue
            rows = conn.execute(
                "SELECT as_of, fwd_return_1d FROM signals_log"
                " WHERE source_model = ? AND fwd_return_1d IS NOT NULL",
                (model,),
            ).fetchall()
            excess_vals = [ret - medians[as_of] for as_of, ret in rows if as_of in medians]
            excess = sum(excess_vals) / len(excess_vals) if excess_vals else float("nan")
            lines.append(
                f"  {model}: liquidadas={settled_n}/{total}"
                f" retorno_medio={avg_ret * 100:+.3f}%/dia"
                f" hit_rate={hit * 100:.1f}%"
                f" exceso_vs_universo={excess * 100:+.3f}%/dia"
            )
        if not any("liquidadas" in ln for ln in lines[1:]):
            lines.append("  (sin señales liquidadas; corre 'settle' cuando haya precios nuevos)")
        return "\n".join(lines)
    finally:
        conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Registro histórico de señales: registra, liquida y mide el hit-rate del modelo"
    )
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("log", help="registra las señales actuales (normalmente automático desde export)")

    p_settle = sub.add_parser("settle", help="liquida señales pendientes con los precios disponibles")
    p_settle.add_argument("--config", default=None)

    p_stats = sub.add_parser("stats", help="muestra el rendimiento histórico del modelo")
    p_stats.add_argument("--config", default=None)

    args = parser.parse_args()

    from qlib_side.common import load_config

    cfg = load_config(args.config) if args.command in ("settle",) else None
    db = default_db_path()
    if args.command == "settle":
        assert cfg is not None
        n = settle(db, Path(cfg["data"]["raw_dir"]), cfg["universe"], int(cfg["signals"].get("horizon_days", 1)))
        print(f"señales liquidadas: {n}")
    elif args.command == "log":
        from bridge.signal_store import load_signals

        signals_path = PROJECT_ROOT / "artifacts" / "signals.json"
        print(f"filas nuevas: {log_signals(db, load_signals(signals_path))}")
    elif args.command == "stats":
        print(stats(db))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        raise SystemExit(1)
