from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from qlib_side.common import venv_python  # noqa: E402

STEPS = ["prepare", "train", "export", "execute"]
MODULES = {
    "prepare": "qlib_side.prepare_data",
    "train": "qlib_side.train_model",
    "export": "qlib_side.export_signals",
    "execute": "vibe_side.execute_signals",
}
VENV_FOR_STEP = {
    "prepare": "qlib",
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
    cmd = [str(py), "-m", MODULES[step]]
    if config:
        cmd += ["--config", config]
    env = dict(os.environ)
    env["PYTHONPATH"] = str(PROJECT_ROOT)
    if step == "train" and force_demo:
        env["QVB_FORCE_DEMO"] = "1"
    print(f"\n=== [{step}] {' '.join(cmd)} ===")
    result = subprocess.run(cmd, cwd=str(PROJECT_ROOT), env=env)
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(
        description="End-to-end pipeline: data -> model -> signals -> order plan"
    )
    parser.add_argument("--config", default=None)
    parser.add_argument("--steps", default=",".join(STEPS), help="comma-separated subset of: " + ",".join(STEPS))
    parser.add_argument("--force-demo", action="store_true", help="skip Qlib training and use the momentum demo model")
    parser.add_argument("--python", default=None, help="interpreter override for every step")
    args = parser.parse_args()

    steps = [s.strip() for s in args.steps.split(",") if s.strip()]
    unknown = [s for s in steps if s not in STEPS]
    if unknown:
        parser.error(f"unknown steps: {unknown}")

    print(f"QuantVibe pipeline | root={PROJECT_ROOT}")
    for step in steps:
        rc = run_step(step, args.config, args.force_demo, args.python)
        if rc != 0:
            print(f"\n[ABORT] step '{step}' exited with code {rc}")
            return rc
    print(
        "\nPipeline finished.\n"
        f"  signals:     {PROJECT_ROOT / 'artifacts' / 'signals.json'}\n"
        f"  order plan:  {PROJECT_ROOT / 'artifacts' / 'orders_plan.json'}\n"
        "Next: point the Vibe-Trading agent at the MCP server (config/mcp.vibe-trading.example.json)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
