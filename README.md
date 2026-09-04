# QuantVibe

[![CI](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml/badge.svg)](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/Ax3lsk3r3/QuantVibe/badges/coverage-badge.json)](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml)
[![Code Style: ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19.2+-61DAFB?logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-OKLCH%20Color-38B2AC?logo=tailwindcss&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

🌐 **Language / Idioma:** [English](README.md) • [Español](README.es.md)  
🚀 **Cloud Deployment Guide:** [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)  
🔴 **Live Server Demo:** [http://47.85.111.6](http://47.85.111.6)

---

> **Where Quantitative Rigor Meets Autonomous Execution.**  
> Institutional-grade quantitative finance platform combining **Microsoft Qlib** (Alpha158 Factor Mining & LightGBM) with autonomous **Vibe-Trading LLM Agents**, bound by zero-import cryptographic barriers and mathematical gate validation.

---

## 🏛️ Architectural Overview

```
┌───────────────── Qlib Brain (Statistical Alpha) ────────────────┐
│                                                                 │
│  Data Lake ──> Alpha158 Mining ──> LightGBM Walk-Forward Model  │
│                                           ↓                     │
│                             Spearman IC & ICIR Gate (≥ 0.05)    │
│                                           ↓                     │
│                        Cryptographic SHA-256 State Vault        │
└───────────────────────────────────────────┬─────────────────────┘
                                            │
                             ZERO-IMPORT AIR GAP BARRIER
                        (Signed Canonical JSON + Stdio FastMCP)
                                            │
                                            ▼
┌──────────────── Vibe Agent Hands (Execution & Risk) ────────────┐
│                                                                 │
│  MCP Client ──> Portfolio Constructor ──> Risk Invariant Guard  │
│                                           (Max 20% single asset)│
│                                           (Sector Neutrality)   │
│                                           ↓                     │
│                          Double-Guarded Execution Desk          │
│                          (--submit + VIBE_ALLOW_ORDERS=1)       │
└─────────────────────────────────────────────────────────────────┘
```

The two systems **never import each other**:
- They communicate exclusively across an immutable signed contract (`artifacts/signals.json`) validated with canonical SHA-256 hashes and a FastMCP stdio interface.
- Python runtime boundaries remain isolated in dedicated environments to prevent dependency conflicts.

---

## ✨ Key Capabilities

1. **Luxury SaaS Web Terminal (Single-Port Architecture)**:
   - Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.
   - Custom **OKLCH** color system for maximum perceptual clarity and deep glassmorphic elevation.
   - Fluid spring motion physics (`apple-design`), tactile press feedback (`better-ui`), and kinetic text animations (`animate-text`).
   - Interactive **Portfolio Simulator & Alpha Factor Laboratory** with real-time recalculation of Sharpe, IC, alpha spread, and dynamic weight constraints.
   - Interactive **Pipeline Topology Visualizer** with live streaming logs via Server-Sent Events (SSE).
   - Single-port FastAPI engine (`0.0.0.0:8000` or port `80`) with native GitHub Codespaces port-forwarding support.

2. **Microsoft Qlib Continuous Factor Mining**:
   - Alpha158 continuous quantitative indicators (momentum, volatility, volume-price interaction, mean-reversion).
   - Rolling walk-forward gradient-boosted decision trees (LightGBM ranker).
   - Automated demo momentum fallback for zero-dependency test runs.

3. **Mathematical Gatekeeper (Quality Firewall)**:
   - Before publishing any trading signal, the model undergoes validation: Spearman Information Coefficient ($IC \ge 0.05$), $ICIR \ge 0.50$, and hit-rate testing.
   - Degraded signals are rejected automatically before reaching the execution layer.

4. **Cryptographic SHA-256 Vault & Zero Data Leakage**:
   - Every signal payload is sealed with a canonical SHA-256 checksum.
   - Audited historical ledger stored in SQLite (`artifacts/track_record.db`).

5. **Double-Guarded Risk Execution**:
   - By default, the execution module only outputs a dry-run order plan (`orders_plan.json`).
   - Real broker order dispatch requires both the `--submit` command-line flag and explicit environment variable `VIBE_ALLOW_ORDERS=1`.

---

## ⚡ Quickstart (One-Command Setup)

### Option 1: Web Interface & API (Local or Codespaces)

```bash
# 1. Clone repository
git clone https://github.com/Ax3lsk3r3/QuantVibe.git
cd QuantVibe

# 2. Install lightweight web dependencies
pip install -r requirements-web.txt

# 3. Launch Web Terminal (Listens on 0.0.0.0:8000)
python scripts/start_web.py
```

* **Web Application:** `http://localhost:8000`
* **Interactive API Docs (Swagger):** `http://localhost:8000/docs`
* **GitHub Codespaces:** Opens automatically on port `8000` without CORS configuration.

---

### Option 2: Full End-to-End Pipeline (Demo Mode)

Runs without external dependencies (only standard `pandas` and `numpy` required):

```bash
python scripts/run_pipeline.py --force-demo
```

**Generated Artifacts:**
* `artifacts/evaluation.json` — Gate validation verdict and statistical IC/ICIR metrics.
* `artifacts/signals.json` — Verified Top-$k$ stock signals with cryptographic SHA-256 seal.
* `artifacts/orders_plan.json` — Equal-weight paper trading order execution plan.
* `artifacts/track_record.db` — SQLite historical ledger for performance auditing.

---

### Option 3: Cloud VPS Deployment (24/7 Production)

Follow our complete deployment manual: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

```bash
# On Ubuntu 22.04 / 24.04 server:
sudo apt update && sudo apt install -y python3-pip python3-venv git
git clone https://github.com/Ax3lsk3r3/QuantVibe.git
cd QuantVibe
python3 -m venv venv && source venv/bin/activate
pip install -r requirements-web.txt
nohup python scripts/start_web.py --port 80 > web.log 2>&1 &
```

---

## 📁 Repository Structure

```
├── config/
│   ├── pipeline.json                 # Universe, train/valid/test splits, gate criteria
│   └── mcp.vibe-trading.example.json # FastMCP configuration for Vibe Agent
├── bridge/
│   ├── signal_store.py               # Schema validation & canonical SHA-256 checksums
│   ├── mcp_server.py                 # FastMCP stdio server (read-only tools)
│   └── track_record.py               # SQLite execution ledger & historical hit-rate
├── qlib_side/
│   ├── prepare_data.py               # OHLCV data converter -> Qlib binary format
│   ├── train_model.py                # LightGBM Alpha158 model & fallback ranker
│   ├── evaluate.py                   # IC, ICIR & Gate verification logic
│   └── export_signals.py             # Validated signal publisher
├── vibe_side/
│   └── execute_signals.py            # Order plan constructor with double guardrails
├── web/
│   ├── api.py                        # FastAPI endpoints, SSE stream & static SPA mount
│   ├── server.py                     # Production server runner
│   ├── static/                       # Compiled production frontend bundle
│   └── frontend/                     # React 19 + TypeScript + Tailwind + Framer Motion
│       ├── src/components/
│       │   ├── Header.tsx            # Frosted glass navigation with spring pill
│       │   ├── LandingPage.tsx       # Luxury SaaS Showcase landing page
│       │   ├── OverviewTab.tsx       # Holographic stock cards & dynamic sparklines
│       │   ├── PipelineTab.tsx       # Live control cockpit & SSE streaming console
│       │   ├── ExecutionTab.tsx      # Risk-guarded execution desk with iOS toggle
│       │   ├── TrackRecordTab.tsx    # SQLite equity curve & performance explorer
│       │   ├── ArchitectureTab.tsx   # 3-Pillar breakdown & knowledge graph status
│       │   └── landing/              # Kinetic titles, simulators & comparison matrix
├── docs/
│   └── DEPLOYMENT_GUIDE.md           # Cloud VPS, ECS, and domain setup manual
├── scripts/
│   ├── start_web.py                  # Single-command web terminal launcher
│   └── run_pipeline.py               # Orchestrator across isolated environments
├── tests/
│   ├── test_bridge.py                # Checksum, schema, and gate integrity tests
│   └── test_web.py                   # 24 FastAPI and static mount unit tests
└── requirements-web.txt              # FastAPI, Uvicorn, Pydantic dependencies
```

---

## 🔒 Security & Safe Execution Invariants

| Invariant | Protection Mechanism | Enforcement |
| :--- | :--- | :--- |
| **Model Quality** | IC $\ge 0.05$, ICIR $\ge 0.50$ Gate | Signals are blocked if alpha has decayed |
| **Payload Integrity** | Canonical SHA-256 Hash | Consumers reject modified or unverified JSON |
| **Architectural Separation** | Zero-Import Policy | `qlib_side` and `vibe_side` never share memory |
| **Position Concentration** | Max 20.0% Weight Cap | Portfolio constructor prevents over-allocation |
| **Broker Safety** | Double-Guarded CLI Flag | Execution requires `--submit` AND `VIBE_ALLOW_ORDERS=1` |

---

## 🧪 Testing Suite

QuantVibe includes automated unit tests covering cryptographic checksums, ranking consistency, gate thresholds, and FastAPI endpoints:

```bash
# Run all unit tests
python -m unittest discover -s tests -v
```

All 29 tests run in under 0.5 seconds with 100% clean passes.

---

## ⚖️ Legal Disclaimer

*This software is created strictly for technical research, educational purposes, and algorithmic simulation. None of the modules, predictions, metrics, or signals constitute financial, tax, or investment advice. Historical backtesting is subject to overfitting and survivorship biases. Always validate strategies in paper trading accounts before deploying capital.*

---

## 📄 License

Distributed under the [MIT License](LICENSE). Copyright © 2026 Ax3lsk3r3.
