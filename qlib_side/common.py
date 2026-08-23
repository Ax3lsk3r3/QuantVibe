from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, NoReturn

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = PROJECT_ROOT / "config" / "pipeline.json"


def load_config(path: str | Path | None = None) -> Dict[str, Any]:
    cfg_path = Path(path) if path else DEFAULT_CONFIG
    if not cfg_path.is_absolute():
        cfg_path = PROJECT_ROOT / cfg_path
    with open(cfg_path, "r", encoding="utf-8") as fh:
        cfg = json.load(fh)
    data = cfg.setdefault("data", {})
    end = str(data.get("end", "auto")).lower()
    if end == "auto":
        from datetime import date

        data["end"] = date.today().isoformat()
    for key in ("raw_dir", "qlib_dir"):
        p = Path(data[key])
        if not p.is_absolute():
            data[key] = str(PROJECT_ROOT / p)
    return cfg


def venv_python(venv_name: str) -> Path:
    venv_dir = PROJECT_ROOT / "venvs" / venv_name
    if os.name == "nt":
        return venv_dir / "Scripts" / "python.exe"
    return venv_dir / "bin" / "python"


def normalize_predictions(pred: Any):
    import pandas as pd

    if isinstance(pred, pd.Series):
        df = pred.rename("score").reset_index()
    elif isinstance(pred, pd.DataFrame):
        df = pred.reset_index()
    else:
        raise TypeError(f"unsupported prediction type: {type(pred)!r}")
    cols = {c.lower(): c for c in df.columns}

    def pick(*names):
        for n in names:
            if n in cols:
                return cols[n]
        return None

    dt_col = pick("datetime", "date") or df.columns[0]
    inst_col = pick("instrument", "symbol")
    score_col = pick("score", "pred")
    if inst_col is None or score_col is None:
        raise ValueError(f"cannot identify instrument/score columns in {list(df.columns)}")
    out = pd.DataFrame(
        {
            "datetime": df[dt_col].astype(str).str[:10],
            "instrument": df[inst_col].astype(str),
            "score": df[score_col].astype(float),
        }
    )
    return out.dropna().sort_values(["datetime", "instrument"]).reset_index(drop=True)


def fail(message: str) -> NoReturn:
    print(f"[ERROR] {message}", file=sys.stderr)
    raise SystemExit(1)
