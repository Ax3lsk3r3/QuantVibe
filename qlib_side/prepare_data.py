from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from qlib_side.common import fail, load_config

RAW_COLUMNS = ["date", "symbol", "open", "high", "low", "close", "volume"]


def _synthetic_frame(symbol: str, start: str, end: str, rng, seed: int) -> pd.DataFrame:
    idx = pd.bdate_range(start=start, end=end)
    n = len(idx)
    drift = 0.0002 + (seed % 100) / 100.0 * 0.0008
    innov = rng.normal(0.0, 0.012, size=n)
    rets = []
    dev = 0.0
    for e in innov:
        dev = 0.55 * dev + e
        rets.append(drift + dev)
    closes = [50.0]
    for r in rets:
        closes.append(closes[-1] * (1.0 + r))
    closes = closes[1:]
    open_ = [c * (1.0 + rng.normal(0, 0.003)) for c in closes]
    high = [max(o, c) * (1.0 + abs(rng.normal(0, 0.004))) for o, c in zip(open_, closes)]
    low = [min(o, c) * (1.0 - abs(rng.normal(0, 0.004))) for o, c in zip(open_, closes)]
    volume = rng.integers(2_000_000, 90_000_000, size=n)
    return pd.DataFrame(
        {
            "date": idx.strftime("%Y-%m-%d"),
            "symbol": symbol,
            "open": [round(v, 4) for v in open_],
            "high": [round(v, 4) for v in high],
            "low": [round(v, 4) for v in low],
            "close": [round(v, 4) for v in closes],
            "volume": volume.astype(int),
        }
    )


def _fetch_yfinance(symbol: str, start: str, end: str) -> pd.DataFrame | None:
    try:
        import yfinance as yf
    except ImportError:
        return None
    try:
        df = yf.download(
            symbol,
            start=start,
            end=end,
            auto_adjust=True,
            progress=False,
            threads=False,
        )
    except Exception:
        return None
    if df is None or df.empty:
        return None
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df = df.reset_index().rename(
        columns={
            "Date": "date",
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume",
        }
    )
    df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
    df["symbol"] = symbol
    df = df[RAW_COLUMNS].dropna()
    for col in ("open", "high", "low", "close"):
        df[col] = df[col].astype(float).round(4)
    df["volume"] = df["volume"].astype("int64")
    return df


def prepare(config_path: str | None = None, force_synthetic: bool = False) -> Path:
    cfg = load_config(config_path)
    universe: list[str] = cfg["universe"]
    start = cfg["data"]["start"]
    end = cfg["data"]["end"]
    raw_dir = Path(cfg["data"]["raw_dir"])
    raw_dir.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, object] = {"generated_at": datetime.now(timezone.utc).isoformat(), "symbols": {}}
    for symbol in universe:
        seed = int(hashlib.sha256(symbol.encode()).hexdigest()[:8], 16)
        frame = None
        source = None
        if not force_synthetic:
            frame = _fetch_yfinance(symbol, start, end)
            source = "yfinance"
        if frame is None:
            import numpy as np

            frame = _synthetic_frame(symbol, start, end, np.random.default_rng(seed), seed)
            source = "synthetic"
        out_csv = raw_dir / f"{symbol}.csv"
        frame.to_csv(out_csv, index=False)
        manifest["symbols"][symbol] = {
            "source": source,
            "rows": int(len(frame)),
            "first": str(frame["date"].iloc[0]),
            "last": str(frame["date"].iloc[-1]),
        }
        print(f"  {symbol:<6} {source:<9} filas={len(frame):>5} {frame['date'].iloc[0]}..{frame['date'].iloc[-1]}")

    manifest_path = raw_dir / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2)

    qlib_dir = Path(cfg["data"]["qlib_dir"])
    dump_ok = False
    vendor = Path(__file__).resolve().parents[1] / "vendor" / "dump_bin.py"
    if not vendor.is_file():
        print("  vendor/dump_bin.py no encontrado; omitiendo conversión a formato qlib")
    else:
        try:
            import shutil
            import subprocess
            import sys as _sys

            tmp_csv = raw_dir.parent / ".raw_qlib_dump"
            if tmp_csv.exists():
                shutil.rmtree(tmp_csv)
            shutil.copytree(raw_dir, tmp_csv, ignore=shutil.ignore_patterns("manifest.json"))
            cmd = [
                _sys.executable,
                str(vendor),
                "dump_all",
                "--data_path",
                str(tmp_csv),
                "--qlib_dir",
                str(qlib_dir),
                "--date_field_name",
                "date",
                "--symbol_field_name",
                "symbol",
                "--exclude_fields",
                "date,symbol",
                "--max_workers",
                "4",
            ]
            proc = subprocess.run(cmd, capture_output=True, text=True)
            shutil.rmtree(tmp_csv, ignore_errors=True)
            if proc.returncode != 0:
                tail = (proc.stderr or proc.stdout or "").strip().splitlines()[-5:]
                print("  fallo el dump de qlib:\n    " + "\n    ".join(tail))
            else:
                dump_ok = (qlib_dir / "instruments" / "all.txt").is_file()
        except Exception as exc:
            print(f"  fallo el dump de qlib: {exc}")
    if dump_ok:
        print(f"  formato qlib escrito en {qlib_dir}")
    else:
        print(
            "  dump a formato qlib no completado; CSVs conservados en "
            f"{raw_dir} (el flujo demo/paper sigue funcionando)"
        )
    return manifest_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Descarga datos de mercado y los convierte al formato de Qlib")
    parser.add_argument("--config", default=None)
    parser.add_argument("--force-synthetic", action="store_true")
    args = parser.parse_args()
    try:
        prepare(args.config, args.force_synthetic)
    except Exception as exc:
        fail(f"prepare_data falló: {exc}")


if __name__ == "__main__":
    main()
