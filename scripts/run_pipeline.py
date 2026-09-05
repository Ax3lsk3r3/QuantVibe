from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from qlib_side.common import venv_python  # noqa: E402

STEPS = ["prepare", "settle", "train", "export", "execute"]
MODULES = {
    "prepare": "qlib_side.prepare_data",
    "settle": "bridge.track_record",
    "train": "qlib_side.train_model",
    "export": "qlib_side.export_signals",
    "execute": "vibe_side.execute_signals",
}
EXTRA_ARGS = {"settle": ["settle"]}
VENV_FOR_STEP = {
    "prepare": "qlib",
    "settle": "base",
    "train": "qlib",
    "export": "qlib",
    "execute": "vibe",
}


def pick_python(step: str, override: str | None) -> Path:
    if override:
        return Path(override)
    candidate = venv_python(VENV_FOR_STEP[step])
    if candidate.is_file():
        return candidate
    return Path(sys.executable)


def run_step(step: str, config: str | None, force_demo: bool, python_override: str | None) -> int:
    py = pick_python(step, python_override)
    cmd = [str(py), "-m", MODULES[step], *EXTRA_ARGS.get(step, [])]
    if config:
        cmd += ["--config", config]
    env = dict(os.environ)
    env["PYTHONPATH"] = str(PROJECT_ROOT)
    if step == "prepare" and force_demo:
        cmd.append("--force-synthetic")
    if step == "train" and force_demo:
        env["QVB_FORCE_DEMO"] = "1"
    if step == "export" and force_demo:
        cmd.append("--force")
    print(f"\n=== [{step}] {' '.join(cmd)} ===")
    result = subprocess.run(cmd, cwd=str(PROJECT_ROOT), env=env)
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Pipeline end-to-end: datos -> modelo -> señales -> plan de órdenes"
    )
    parser.add_argument("--config", default=None)
    parser.add_argument("--steps", default=",".join(STEPS), help="subconjunto separado por comas de: " + ",".join(STEPS))
    parser.add_argument("--force-demo", action="store_true", help="omite el entrenamiento con Qlib y usa el modelo demo de momentum")
    parser.add_argument("--python", default=None, help="intérprete alternativo para todos los pasos")
    args = parser.parse_args()

    steps = [s.strip() for s in args.steps.split(",") if s.strip()]
    unknown = [s for s in steps if s not in STEPS]
    if unknown:
        parser.error(f"unknown steps: {unknown}")

    print(f"QuantVibe pipeline | root={PROJECT_ROOT}")
    for step in steps:
        rc = run_step(step, args.config, args.force_demo, args.python)
        if rc != 0:
            print(f"\n[ABORTE] el paso '{step}' terminó con código {rc}")
            return rc
    print(
        "\nPipeline terminado.\n"
        f"  señales:     {PROJECT_ROOT / 'artifacts' / 'signals.json'}\n"
        f"  plan de órdenes: {PROJECT_ROOT / 'artifacts' / 'orders_plan.json'}\n"
        "Siguiente paso: apunta el agente Vibe-Trading al servidor MCP (config/mcp.vibe-trading.example.json)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
