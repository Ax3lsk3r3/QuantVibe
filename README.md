# QuantVibe

[![CI](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml/badge.svg)](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/Ax3lsk3r3/QuantVibe/badges/coverage-badge.json)](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml)
[![Code Style: ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-blue?logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/docker-ghcr.io%2Fax3lsk3r3%2Fquantvibe-2496ED?logo=docker&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Language: **English** | [Español](README.es.md)

**Uses [Qlib](https://github.com/microsoft/qlib) as the quantitative brain and [Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) as the execution hands.**

`QuantVibe` is an integration project connecting two independent quantitative finance tools without forking either:

- **Qlib** (Microsoft) trains machine learning models on market data and produces stock rank scores.
- **Vibe-Trading** (HKUDS) is an LLM-powered trading agent that consumes those scores via a read-only MCP server and acts on them (paper trading by default).

The bridge is ~600 lines of clean Python with zero heavy dependencies:

```
┌──────────── Qlib Side (Dedicated venv) ──────┐      ┌───── Vibe-Trading Side (Dedicated venv) ────┐
│                                              │      │                                              │
│  prepare_data    OHLCV -> Qlib binary format │      │  LLM Agent (MCP Client)                      │
│       ↓                                      │ MCP  │       ↓                                      │
│  train_model     LGBModel (or demo fallback) │─────→│  get_latest_signals()                        │
│       ↓                                      │ stdio│       ↓                                      │
│  export_signals  top-k + SHA-256 checksum    │      │  execute_signals   orders plan (paper)       │
└──────────────────────────────────────────────┘      │       ↓                                      │
                                                      │  shadow account -> broker                    │
                                                      └──────────────────────────────────────────────┘
```

The two systems **never import each other**: they communicate exclusively across an immutable signed contract (`artifacts/signals.json`, tamper-proofed with SHA-256 checksums) and a FastMCP stdio server. Each side runs in its own virtual environment to prevent dependency conflicts.

## Features

- **One-command demo**: Runs end-to-end without external services using synthetic trend data and a momentum fallback when pyqlib/yfinance are not installed.
- **Real mode**: Downloads OHLCV data via yfinance -> converts with `qlib.scripts.dump_bin` -> computes Alpha158 features -> trains LightGBM ranker -> outputs predictions.
- **Signed signal contract**: Schema validation, contiguous rank validation, finite score guarantees, and canonical JSON SHA-256 checksum verification. Any tampering is rejected.
- **Evaluation gate**: Evaluates Spearman correlation (Information Coefficient), ICIR, and top-k hit-rate against forward returns before signals are published. Degraded signals are rejected.
- **SQLite track record**: Every published signal is logged to `artifacts/track_record.db` and settled against realized prices. `stats` command reports real hit-rate and excess return.
- **FastMCP server** (`bridge/mcp_server.py`): Exposes three read-only tools: `get_latest_signals`, `list_universe`, and `signal_health` (freshness check).
- **Guarded execution**: By default, `execute_signals.py` only outputs a dry-run order plan (`orders_plan.json`). Real broker order submission requires `--submit` and the explicit environment variable `VIBE_ALLOW_ORDERS=1`.
- **Data provenance**: Tracks whether each symbol originated from yfinance or the synthetic generator via `manifest.json` -> `signals.json`.

## Structure

```
config/pipeline.json                 universe, dates, train/valid/test splits, top_k, notional
config/mcp.vibe-trading.example.json MCP server registration config for Vibe-Trading agent
bridge/signal_store.py               schema, validation, and SHA-256 checksums (pure Python)
bridge/mcp_server.py                 FastMCP stdio server (compatible with MCP SDK 1.x / FastMCP)
bridge/track_record.py               historical SQLite signal ledger (log / settle / stats)
qlib_side/prepare_data.py            yfinance (or synthetic) -> CSV -> Qlib binary format
qlib_side/train_model.py             Qlib LGBModel; automatic DemoMomentum fallback
qlib_side/evaluate.py                IC / ICIR / hit-rate evaluation + publication gate
qlib_side/export_signals.py          predictions.csv -> gate evaluation -> verified signals.json
vibe_side/execute_signals.py         signals -> equal-weight plan; double-guarded execution
web/api.py                           FastAPI REST API, SSE streaming, and static SPA mounting
web/server.py                        production web runner
web/static/                          compiled production frontend assets
web/frontend/                        React 19 + TypeScript + Tailwind + Framer Motion
docs/DEPLOYMENT_GUIDE.md             cloud VPS and server deployment guide
scripts/start_web.py                 one-command web launcher (single port: 8000 or 80)
scripts/run_pipeline.py              end-to-end orchestrator across isolated venvs
scripts/setup.ps1                    sets up venvs\qlib and venvs\vibe and installs dependencies
Dockerfile                           Python 3.11 container with pyqlib; runs tests on build
```

Generated artifacts:
- `artifacts/signals.json` — signed top-k signals consumed by the MCP agent
- `artifacts/orders_plan.json` — equal-weight paper trading order plan (`dry_run: true`)
- `artifacts/track_record.db` — SQLite historical ledger measuring real hit-rate
- `data/raw/*.csv` — OHLCV per symbol with provenance in `manifest.json`

Pipeline steps: `prepare -> settle -> train -> export -> execute`.
The `settle` step settles historical signals from previous dates using newly available prices.

## Web Interface and Terminal (Local, Codespaces & Cloud VPS)

QuantVibe includes a modern fintech terminal web interface built with FastAPI, React 19, TypeScript, and Tailwind CSS. It is designed to run locally, on **GitHub Codespaces**, or on a cloud VPS using a single unified port (default `8000`, or port `80`).

### Launching the Web Interface

```bash
# 1. Install lightweight web dependencies
pip install -r requirements-web.txt

# 2. Launch web server (listens on 0.0.0.0:8000)
python scripts/start_web.py
```

- **Local / Codespaces URL:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`

### Interface Features

1. **Dashboard & Quality Gate:** Real-time visual traffic light of model verdict (Spearman IC, ICIR, hit-rate), SHA-256 cryptographic verification status, and interactive Top-$k$ signal table.
2. **Interactive Pipeline Launcher:** Mode selector (Demo vs Full Qlib), granular phase triggers, and real-time streaming console output via Server-Sent Events (SSE).
3. **Execution Desk & Guardrails:** Visualizer for `orders_plan.json`, portfolio exposure breakdown, and a hardware-style safety switch toggling Paper Trading vs real order dispatch (`VIBE_ALLOW_ORDERS=1`).
4. **Track Record & Audit:** Historical performance settled in SQLite (`artifacts/track_record.db`), hit-rate metrics, and excess return vs universe benchmark.
5. **Architecture & MCP Inspector:** Status monitor for FastMCP stdio server and indexed knowledge graphs.

### Frontend Development

The frontend source lives in `web/frontend/` and compiles to static files in `web/static/`:

```bash
cd web/frontend
pnpm install
pnpm build     # builds production assets to web/static/
pnpm dev       # Vite dev server on port 5173 with proxy to FastAPI :8000
```

## Evaluation Gate and Track Record

Before signals are published, `export` evaluates the model: Spearman rank correlation (IC) between model scores and realized forward returns per date, ICIR (IC / volatility of IC), and top-k hit-rate. Thresholds are defined in `config/pipeline.json -> evaluation.gate`. If the model fails validation, signals are blocked (`--force` bypasses if needed).

To inspect realized performance over time:

```bash
python -m bridge.track_record stats     # hit-rate, mean return, excess vs universe
python -m bridge.track_record settle    # settles pending records with new market prices
```

## Full Setup (Real Data + Real Model)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
python scripts/run_pipeline.py
```

| venv | Packages | Python Version |
|------|----------|----------------|
| `venvs\qlib` | `pyqlib`, `yfinance` | **3.10–3.12 required** (pyqlib does not build on 3.13+) |
| `venvs\vibe` | `vibe-trading-ai` | 3.11+ |

Without a compatible interpreter for Qlib, the pipeline falls back to demo mode automatically — output indicates which mode ran.

## Docker (Alternative to venvs)

Solves Python version differences: the Docker image runs Python 3.11 with `pyqlib` preinstalled, running the test suite during build.

```bash
docker compose build                      # builds image and runs tests
docker compose run --rm pipeline          # full pipeline with real data/model
docker compose up -d signals-mcp          # MCP server over SSE on http://localhost:8000/sse
```

A prebuilt image is also published to GitHub Container Registry with every commit to `main`:

```bash
docker pull ghcr.io/ax3lsk3r3/quantvibe:latest
docker run --rm -v ./data:/app/data -v ./artifacts:/app/artifacts ghcr.io/ax3lsk3r3/quantvibe:latest python scripts/run_pipeline.py --force-demo
```

Mount `./data` and `./artifacts` as volumes so signals, plans, and the track record database persist on your local filesystem.

## Cloud Deployment (24/7 Production)

For deploying QuantVibe on a cloud server (e.g. Alibaba Cloud ECS, AWS EC2, or DigitalOcean):

See our step-by-step operations guide: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

```bash
# On an Ubuntu 22.04 / 24.04 server:
sudo apt update && sudo apt install -y python3-pip python3-venv git
git clone https://github.com/Ax3lsk3r3/QuantVibe.git
cd QuantVibe
python3 -m venv venv && source venv/bin/activate
pip install -r requirements-web.txt
nohup python scripts/start_web.py --port 80 > web.log 2>&1 &
```

## Connecting the Vibe-Trading Agent

Register the MCP server (example in `config/mcp.vibe-trading.example.json`; verify tool names against your Vibe-Trading installation):

```jsonc
{
  "mcpServers": {
    "quantvibe-signals": {
      "command": "python",
      "args": ["-m", "bridge.mcp_server"],
      "cwd": "<path-to-this-repo>"
    }
  }
}
```

Recommended agent workflow:

1. `signal_health` — verify signals are fresh (< N hours old).
2. `get_latest_signals` — inspect rankings and scores; reason about news, risk, and position sizing.
3. Output or execute only the reviewed orders plan.

## Live Trading (When Ready)

By design, no order ever reaches a broker implicitly:

```bash
# Windows PowerShell
$env:VIBE_ALLOW_ORDERS = "1"
python -m vibe_side.execute_signals --submit --order-cmd-template "<broker CLI> {symbol} {qty}"

# Linux / macOS
export VIBE_ALLOW_ORDERS=1
python -m vibe_side.execute_signals --submit --order-cmd-template "<broker CLI> {symbol} {qty}"
```

If either the `--submit` flag or the environment variable is missing, execution exits with code 2 and zero orders are placed. Start with Vibe-Trading paper trading accounts before deploying capital.

## Signals Payload Format

```jsonc
{
  "schema_version": 1,
  "generated_at": "2026-08-23T19:33:05+00:00",
  "source_model": "LGBModel",           // or DemoMomentum
  "as_of": "2026-08-21",
  "horizon_days": 1,
  "universe": ["AAPL", "..."],
  "signals": [
    { "instrument": "AAPL", "score": 0.109, "rank": 1 }
  ],
  "metadata": { "data_source": "yfinance", "top_k": 5, "test_window": ["...", "..."] },
  "checksum": "sha256 canonical JSON hash"  // verified by consumers before loading
}
```

## Troubleshooting

- **`pyqlib` installation fails**: You are using Python 3.13 or 3.14. Create the venv using Python 3.10-3.12 (`py -3.12`).
- **`No MCP server runtime found`**: In the environment executing the MCP server: `pip install "mcp>=1.2,<2"` or `pip install fastmcp`.
- **yfinance rate limits**: Affected symbols fall back to synthetic data marked in `manifest.json`. Delete `data/raw` and retry later.

## Community

- [Contributing](CONTRIBUTING.md) — bug reports and pull requests
- [Security](SECURITY.md) — vulnerability disclosure policy
- [Issues](https://github.com/Ax3lsk3r3/QuantVibe/issues) — issue templates

## Legal Notice and Disclaimer

This software is provided strictly for educational, experimental, and technical research purposes. None of the modules, code, signals, metrics, or analysis generated by this system constitute financial, investment, legal, or tax advice.

- **Predictive Modeling Risk**: Scores and rankings produced by machine learning models are statistical estimates based on historical data. They do not guarantee future returns or operational certainty.
- **Overfitting**: Backtesting results carry inherent historical fit biases and do not accurately reflect real-world market liquidity, spreads, execution slippage, commissions, or live volatility.
- **Language Model (LLM) Behavior**: Decisions generated by LLM-based agents can exhibit hallucinations, contextual bias, or faulty reasoning regarding market dynamics.
- **Simulation Only**: Users are advised to operate solely within paper trading accounts and zero-risk simulators. Any live capital deployment is the sole and exclusive responsibility of the user.

## License

Distributed under the [MIT License](LICENSE).
