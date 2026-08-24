from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

import numpy as np
import pandas as pd

ARTIFACTS = Path(__file__).resolve().parents[1] / "artifacts"
DEFAULT_THRESHOLDS = {"min_days": 60, "min_mean_ic": 0.0, "min_icir": 0.0}


def _spearman(x: np.ndarray, y: np.ndarray) -> float:
    if len(x) < 3 or np.std(x) == 0 or np.std(y) == 0:
        return float("nan")
    rx = pd.Series(x).rank().to_numpy()
    ry = pd.Series(y).rank().to_numpy()
    return float(np.corrcoef(rx, ry)[0, 1])


def ic_metrics(scores_wide: pd.DataFrame, fwd_wide: pd.DataFrame, top_k: int) -> Dict[str, Any]:
    common = scores_wide.index.intersection(fwd_wide.index)
    cols = scores_wide.columns.intersection(fwd_wide.columns)
    s = scores_wide.loc[common, cols]
    f = fwd_wide.loc[common, cols]

    ics: list[float] = []
    topk_hits = 0
    topk_means: list[float] = []
    univ_means: list[float] = []
    for t in common:
        row_s = s.loc[t].dropna()
        row_f = f.loc[t].reindex(row_s.index).dropna()
        row_s = row_s.reindex(row_f.index)
        if len(row_s) < 4:
            continue
        ic = _spearman(row_s.to_numpy(), row_f.to_numpy())
        if np.isfinite(ic):
            ics.append(ic)
        k = min(top_k, len(row_s))
        top_idx = row_s.sort_values(ascending=False).index[:k]
        topk_means.append(float(row_f.loc[top_idx].mean()))
        univ_means.append(float(row_f.mean()))
        topk_hits += int(topk_means[-1] > univ_means[-1])

    n_days = len(ics)
    ic_arr = np.asarray(ics, dtype=float)
    mean_ic = float(ic_arr.mean()) if n_days else float("nan")
    std_ic = float(ic_arr.std(ddof=1)) if n_days > 1 else float("nan")
    icir = mean_ic / std_ic if n_days > 1 and std_ic and np.isfinite(std_ic) and std_ic > 0 else float("nan")
    return {
        "n_days": n_days,
        "mean_ic": mean_ic,
        "icir": icir,
        "hit_rate_topk": (topk_hits / n_days) if n_days else float("nan"),
        "avg_topk_fwd_return": float(np.mean(topk_means)) if topk_means else float("nan"),
        "avg_universe_fwd_return": float(np.mean(univ_means)) if univ_means else float("nan"),
    }


def check_gate(metrics: Dict[str, Any], thresholds: Dict[str, Any]) -> Dict[str, Any]:
    th = {**DEFAULT_THRESHOLDS, **thresholds}
    failures = []
    if metrics["n_days"] < th["min_days"]:
        failures.append(f"dias insuficientes: {metrics['n_days']} < {th['min_days']}")
    if not (np.isfinite(metrics["mean_ic"]) and metrics["mean_ic"] >= th["min_mean_ic"]):
        failures.append(f"mean_ic {metrics['mean_ic']:.4f} < {th['min_mean_ic']}")
    if not (np.isfinite(metrics["icir"]) and metrics["icir"] >= th["min_icir"]):
        failures.append(f"icir {metrics['icir']:.4f} < {th['min_icir']}")
    return {"passed": not failures, "failures": failures, "thresholds": th}


def forward_returns_frame(raw_dir: Path, universe: list[str], horizon: int) -> pd.DataFrame:
    out: dict[str, pd.Series] = {}
    for symbol in universe:
        csv_path = raw_dir / f"{symbol}.csv"
        if not csv_path.is_file():
            continue
        df = pd.read_csv(csv_path, usecols=["date", "close"]).sort_values("date")
        close = df.set_index("date")["close"].astype(float)
        fwd = close.shift(-1 - horizon) / close.shift(-1) - 1.0
        out[symbol] = fwd
    return pd.DataFrame(out)


def evaluate_predictions(
    predictions: pd.DataFrame,
    raw_dir: Path,
    cfg_eval: Dict[str, Any],
    top_k: int,
) -> Dict[str, Any]:
    horizon = int(cfg_eval.get("fwd_horizon", 1))
    fwd_wide = forward_returns_frame(raw_dir, sorted(predictions["instrument"].unique()), horizon)
    scores_wide = predictions.pivot_table(index="datetime", columns="instrument", values="score")
    metrics = ic_metrics(scores_wide, fwd_wide, top_k)
    verdict = check_gate(metrics, cfg_eval.get("gate", {}))
    return {
        **metrics,
        **verdict,
        "fwd_horizon": horizon,
        "evaluated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }


def write_evaluation_report(report: Dict[str, Any]) -> Path:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    out = ARTIFACTS / "evaluation.json"
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    return out


def format_report(report: Dict[str, Any]) -> str:
    lines = [
        "Evaluación del modelo (gate de backtest):",
        f"  dias evaluados      : {report['n_days']} (horizonte {report['fwd_horizon']}d)",
        f"  IC medio            : {report['mean_ic']:+.4f}",
        f"  ICIR                : {report['icir']:+.4f}",
        f"  hit-rate top-k      : {report['hit_rate_topk']*100:.1f}%",
        f"  retorno medio top-k : {report['avg_topk_fwd_return']*100:+.3f}% vs universo "
        f"{report['avg_universe_fwd_return']*100:+.3f}%",
        (
            "  veredicto           : APROBADO"
            if report["passed"]
            else "  veredicto           : REPROBADO -> " + "; ".join(report["failures"])
        ),
    ]
    return "\n".join(lines)
