# qlib-vibe-bridge

[English](README.md) | [Español](README_es.md)

**Use [Qlib](https://github.com/microsoft/qlib) as the quant brain and [Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) as the hands.**

`qlib-vibe-bridge` is a small integration project that connects two existing tools without forking either of them:

- **Qlib** (Microsoft) trains an ML model on market data and produces cross-sectional stock scores.
- **Vibe-Trading** (HKUDS) is an LLM trading agent that can read those scores through a read-only MCP server and act on them (paper trading first).

The bridge itself is ~600 lines of dependency-light Python:

```
┌──────────── Qlib side (own venv) ────────────┐      ┌──────── Vibe-Trading side (own venv) ────────┐
│                                              │      │                                              │
│  prepare_data    OHLCV -> Qlib binary format │      │  LLM agent (MCP client)                      │
│       ↓                                      │ MCP  │       ↓                                      │
│  train_model     LGBModel (or demo fallback) │─────→│  get_latest_signals()                        │
│       ↓                                      │ stdio│       ↓                                      │
│  export_signals  top-k + SHA-256 checksum    │      │  execute_signals   order plan (paper)        │
└──────────────────────────────────────────────┘      │       ↓                                      │
                                                      │  shadow account → broker                     │
                                                      └──────────────────────────────────────────────┘
```

The two worlds **never import each other**. They communicate through one signed file
(`artifacts/signals.json`, tamper-evident via checksum) and a stdio MCP server. Each side
lives in its own virtualenv, so the very different dependency trees never collide.

## Features

- **One-command demo** that runs end-to-end with no external services: synthetic GBM market
  data + momentum scoring fallback when pyqlib/yfinance are not installed.
- **Real mode**: yfinance download → `qlib.scripts.dump_bin` conversion → Alpha158 features →
  LGBModel training → predictions.
- **Signed signals contract**: schema validation, contiguous ranking, finite-score checks and
  a SHA-256 checksum over the canonical JSON — any post-hoc edit is rejected by the consumer.
- **MCP server** (`bridge/mcp_server.py`) exposing three read-only tools:
  `get_latest_signals`, `list_universe`, `signal_health` (staleness gate).
- **Execution guardrails**: `execute_signals.py` only writes an *order plan* by default.
  Real submission requires BOTH `--submit` AND the env flag `VIBE_ALLOW_ORDERS=1`.
- **Provenance tracking**: whether each symbol came from yfinance or from the synthetic
  generator travels inside `manifest.json` → `signals.json`.

## Project layout

```
config/pipeline.json          universe, date ranges, train/valid/test segments, top_k, notional
config/mcp.vibe-trading.example.json  how to register this MCP server in a Vibe-Trading agent
bridge/signal_store.py        signal schema + validation + checksums (pure Python)
bridge/mcp_server.py          FastMCP stdio server (works with mcp SDK 1.x or fastmcp)
qlib_side/prepare_data.py     yfinance (or synthetic) -> CSV -> Qlib binary format
qlib_side/train_model.py      Qlib LGBModel; automatic DemoMomentum fallback
qlib_side/export_signals.py   predictions.csv -> verified signals.json
vibe_side/execute_signals.py  signals -> equal-weight order plan; guarded submit hook
scripts/run_pipeline.py       end-to-end orchestrator (picks the right venv per step)
scripts/setup.ps1             creates venvs\qlib and venvs\vibe, installs deps
tests/                        unittest suite for the bridge (checksum, top-k, validation)
```

## Quick start

Requirements: Python ≥ 3.10 with `pandas` for demo mode. Nothing else.

```powershell
git clone https://github.com/Ax3lsk3r3/qlib-vibe-bridge.git
cd qlib-vibe-bridge

# run the test suite
python -m unittest discover -s tests

# full pipeline in demo mode (no installs needed beyond pandas/numpy)
python scripts/run_pipeline.py --force-demo
```

Output you get:

- `artifacts/signals.json` — signed top-k signals consumed by the agent/MCP tools
- `artifacts/orders_plan.json` — equal-weight paper order plan (`dry_run: true`)
- `data/raw/*.csv` — per-symbol OHLCV + `manifest.json` provenance

## Full setup (real data + real model)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
python scripts/run_pipeline.py
```

`setup.ps1` builds two isolated environments:

| venv | contents | Python |
|------|----------|--------|
| `venvs\qlib` | `pyqlib`, `yfinance` | **3.10–3.12 required** (pyqlib does not build on 3.13+) |
| `venvs\vibe` | `vibe-trading-ai` | 3.11+ |

Without a compatible interpreter for Qlib, everything still runs via the demo fallback —
the pipeline prints which mode it used.

## Wiring the Vibe-Trading agent

Register the MCP server (example in `config/mcp.vibe-trading.example.json`; check exact key
names against your Vibe-Trading version):

```jsonc
{
  "mcpServers": {
    "qlib-signals": {
      "command": "python",
      "args": ["-m", "bridge.mcp_server"],
      "cwd": "<path-to-this-repo>"
    }
  }
}
```

Recommended agent loop:

1. `signal_health` — are the signals fresh (< N hours)?
2. `get_latest_signals` — read ranks/scores and reason about them (news, risk, sizing).
3. Execute or hand off only the reviewed plan.

## Going live (when ready)

By design nothing ever reaches a broker implicitly:

```powershell
$env:VIBE_ALLOW_ORDERS = "1"
python -m vibe_side.execute_signals --submit --order-cmd-template "<your broker CLI> {symbol} {qty}"
```

Missing either barrier → exit code 2, no orders. Start with Vibe-Trading's shadow/paper
account and review several sessions before even thinking about real money.

## Signal file format

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
  "checksum": "sha256 over the canonical JSON above"  // verified by every consumer
}
```

## Troubleshooting

- **`pyqlib` install fails** → you are on Python 3.13/3.14. Create the qlib venv with
  `py -3.12` (the setup script tries 3.12/3.11/3.10 automatically).
- **`No MCP server runtime found`** → in the environment that runs the MCP server:
  `pip install "mcp>=1.2,<2"` or `pip install fastmcp`.
- **yfinance rate-limits** → the affected symbols fall back to synthetic data and it is
  declared in `manifest.json`; delete `data/raw` and retry later for clean data.

## Disclaimer

Educational software. Not financial advice. Model scores are not predictions you should
trust with money; backtests overfit; LLM agents make mistakes. Use paper trading.

## License

MIT — see [LICENSE](LICENSE).
