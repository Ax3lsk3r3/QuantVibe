from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from qlib_side.common import fail, load_config, normalize_predictions

ARTIFACTS = Path(__file__).resolve().parents[1] / "artifacts"


def _demo_momentum(cfg) -> "object":
    import pandas as pd

    window = int(cfg["training"].get("momentum_window", 20))
    raw_dir = Path(cfg["data"]["raw_dir"])
    rows = []
    for symbol in cfg["universe"]:
        csv_path = raw_dir / f"{symbol}.csv"
        if not csv_path.is_file():
            continue
        df = pd.read_csv(csv_path)
        df = df.sort_values("date")
        if len(df) <= window:
            continue
        closes = df["close"].astype(float).reset_index(drop=True)
        score = float(closes.iloc[-1] / closes.iloc[-1 - window] - 1.0)
        rows.append({"datetime": str(df["date"].iloc[-1]), "instrument": symbol, "score": score})
    if not rows:
        fail("no se encontraron datos crudos para el modo demo; ejecuta qlib_side.prepare_data primero")
    return normalize_predictions(pd.DataFrame(rows))


def _train_qlib(cfg) -> "object":
    import qlib
    from qlib.constant import REG_CN, REG_US
    from qlib.utils import init_instance_by_config

    region = REG_US if str(cfg.get("region", "us")).lower() == "us" else REG_CN
    qlib.init(provider_uri=cfg["data"]["qlib_dir"], region=region)

    segments = {name: tuple(bounds) for name, bounds in cfg["training"]["segments"].items()}
    handler_kwargs = dict(cfg["training"].get("handler_kwargs", {}))
    handler_config = {
        "class": "Alpha158",
        "module_path": "qlib.contrib.data.handler",
        "kwargs": {
            **handler_kwargs,
            "start_time": segments["train"][0],
            "end_time": segments["test"][1],
            "fit_start_time": segments["train"][0],
            "fit_end_time": segments["train"][1],
            "label": [cfg["training"]["label"]],
        },
    }
    dataset_config = {
        "class": "DatasetH",
        "module_path": "qlib.data.dataset",
        "kwargs": {"handler": handler_config, "segments": segments},
    }
    model_config = {
        "class": "LGBModel",
        "module_path": "qlib.contrib.model.gbdt",
        "kwargs": dict(cfg["training"].get("lgbm_kwargs", {})),
    }
    dataset = init_instance_by_config(dataset_config)
    model = init_instance_by_config(model_config)
    model.fit(dataset)
    pred = model.predict(dataset)
    return normalize_predictions(pred)


def train(config_path: str | None = None, force_demo: bool | None = None):
    import pandas as pd

    cfg = load_config(config_path)
    demo_env = os.environ.get("QVB_FORCE_DEMO", "").strip() == "1"
    demo = force_demo if force_demo is not None else demo_env

    source_model = "LGBModel"
    data_source = "qlib"
    pred = None
    if not demo:
        try:
            import qlib  # noqa: F401

            print("  Qlib detectado -> entrenando LGBModel (puede tardar unos minutos)")
            pred = _train_qlib(cfg)
        except ImportError:
            print("  pyqlib no instalado -> usando DemoMomentum")
            demo = True
        except Exception as exc:
            print(f"  entrenamiento con Qlib falló ({exc}) -> usando DemoMomentum")
            demo = True
    if pred is None:
        source_model = "DemoMomentum"
        manifest_path = Path(cfg["data"]["raw_dir"]) / "manifest.json"
        if manifest_path.is_file():
            with open(manifest_path, "r", encoding="utf-8") as fh:
                sources = {v.get("source") for v in json.load(fh)["symbols"].values()}
            data_source = sources.pop() if len(sources) == 1 else "mixed"
        else:
            data_source = "unknown"
        pred = _demo_momentum(cfg)

    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    out_csv = ARTIFACTS / "predictions.csv"
    assert isinstance(pred, pd.DataFrame)
    pred.to_csv(out_csv, index=False)

    meta_path = ARTIFACTS / "predictions.meta.json"
    with open(meta_path, "w", encoding="utf-8") as fh:
        json.dump(
            {
                "source_model": source_model,
                "data_source": data_source,
                "rows": int(len(pred)),
                "as_of": str(pred["datetime"].max()),
                "test_window": list(cfg["training"]["segments"]["test"]),
            },
            fh,
            indent=2,
        )
    print(f"  predicciones escritas: {out_csv} filas={len(pred)} modelo={source_model}")
    return out_csv


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Entrena el modelo de señales (Qlib o fallback demo)")
    parser.add_argument("--config", default=None)
    parser.add_argument("--force-demo", action="store_true")
    args = parser.parse_args()
    try:
        train(args.config, args.force_demo or None)
    except SystemExit:
        raise
    except Exception as exc:
        fail(f"train_model falló: {exc}")
