from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

from bridge import signal_store
from qlib_side.common import PROJECT_ROOT, fail, load_config

ARTIFACTS = PROJECT_ROOT / "artifacts"
SIGNALS_OUT = ARTIFACTS / "signals.json"


def export(config_path: str | None = None, as_of: str | None = None) -> Path:
    cfg = load_config(config_path)
    pred_csv = ARTIFACTS / "predictions.csv"
    meta_json = ARTIFACTS / "predictions.meta.json"
    if not pred_csv.is_file() or not meta_json.is_file():
        fail("predicciones no encontradas; ejecuta qlib_side.train_model primero")
    df = pd.read_csv(pred_csv)
    with open(meta_json, "r", encoding="utf-8") as fh:
        meta = json.load(fh)

    if as_of is None:
        as_of = str(df["datetime"].max())
    day = df[df["datetime"] == as_of]
    if day.empty:
        fail(f"no hay predicciones para {as_of}")

    scores = dict(zip(day["instrument"].astype(str), day["score"].astype(float)))
    top_k = int(cfg["signals"]["top_k"])
    horizon = int(cfg["signals"].get("horizon_days", 1))
    signals = signal_store.select_top_k(scores, min(top_k, len(scores)))

    payload = signal_store.build_payload(
        signals=signals,
        universe=cfg["universe"],
        as_of=as_of,
        source_model=meta.get("source_model", "unknown"),
        data_source=meta.get("data_source", "unknown"),
        top_k=top_k,
        horizon_days=horizon,
        test_start=str(meta.get("test_window", ["?", "?"])[0]),
        test_end=str(meta.get("test_window", ["?", "?"])[1]),
    )
    out = signal_store.write_signals(SIGNALS_OUT, payload)
    print(signal_store.summary(payload))
    print(f"  señales escritas: {out}")
    return out


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convierte predicciones en señales verificadas para el agente")
    parser.add_argument("--config", default=None)
    parser.add_argument("--as-of", default=None, help="YYYY-MM-DD (por defecto: última fecha con predicción)")
    args = parser.parse_args()
    try:
        export(args.config, args.as_of)
    except SystemExit:
        raise
    except Exception as exc:
        fail(f"export_signals falló: {exc}")
