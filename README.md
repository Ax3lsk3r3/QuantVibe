# QuantVibe

**Usa [Qlib](https://github.com/microsoft/qlib) como cerebro cuant y [Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) como manos.**

`QuantVibe` es un pequeño proyecto de integración que conecta dos herramientas existentes sin hacer fork de ninguna:

- **Qlib** (Microsoft) entrena un modelo ML con datos de mercado y produce scores de acciones.
- **Vibe-Trading** (HKUDS) es un agente de trading basado en LLM que lee esos scores vía un servidor MCP read-only y actúa sobre ellos (paper trading primero).

El puente son ~600 líneas de Python sin dependencias pesadas:

```
┌──────────── Lado Qlib (venv propio) ─────────┐      ┌───── Lado Vibe-Trading (venv propio) ────────┐
│                                              │      │                                              │
│  prepare_data    OHLCV -> formato Qlib       │      │  Agente LLM (cliente MCP)                    │
│       ↓                                      │ MCP  │       ↓                                      │
│  train_model     LGBModel (o demo fallback)  │─────→│  get_latest_signals()                        │
│       ↓                                      │ stdio│       ↓                                      │
│  export_signals  top-k + checksum SHA-256    │      │  execute_signals   plan de órdenes (paper)   │
└──────────────────────────────────────────────┘      │       ↓                                      │
                                                      │  cuenta sombra → broker                      │
                                                      └──────────────────────────────────────────────┘
```

Los dos mundos **nunca se importan entre sí**: se comunican por un archivo firmado (`artifacts/signals.json`, a prueba de manipulación vía checksum) y un servidor MCP stdio. Cada lado vive en su propio venv, así los árboles de dependencias nunca chocan.

## Características

- **Demo con un comando** que corre end-to-end sin servicios externos: datos sintéticos GBM + fallback de momentum cuando pyqlib/yfinance no están instalados.
- **Modo real**: descarga yfinance → conversión `qlib.scripts.dump_bin` → features Alpha158 → entrenamiento LGBModel → predicciones.
- **Contrato de señales firmado**: validación de esquema, ranking contiguo, scores finitos y checksum SHA-256 sobre el JSON canónico — cualquier edición posterior es rechazada.
- **Servidor MCP** (`bridge/mcp_server.py`) con tres tools read-only: `get_latest_signals`, `list_universe`, `signal_health` (control de frescura).
- **Guardarraíles de ejecución**: `execute_signals.py` solo escribe un *plan de órdenes* por defecto. Enviar órdenes reales exige `--submit` Y la variable `VIBE_ALLOW_ORDERS=1`.
- **Trazabilidad de procedencia**: si cada símbolo vino de yfinance o del generador sintético viaja en `manifest.json` → `signals.json`.

## Estructura

```
config/pipeline.json          universo, fechas, segmentos train/valid/test, top_k, notional
config/mcp.vibe-trading.example.json  registro del servidor MCP en el agente Vibe-Trading
bridge/signal_store.py        esquema + validación + checksums (Python puro)
bridge/mcp_server.py          servidor FastMCP stdio (compatible mcp SDK 1.x o fastmcp)
qlib_side/prepare_data.py     yfinance (o sintético) -> CSV -> formato binario de Qlib
qlib_side/train_model.py      LGBModel de Qlib; fallback automático DemoMomentum
qlib_side/export_signals.py   predictions.csv -> signals.json verificado
vibe_side/execute_signals.py  señales -> plan equal-weight; submit con doble guardia
scripts/run_pipeline.py       orquestador end-to-end (elige el venv correcto por paso)
scripts/setup.ps1             crea venvs\qlib y venvs\vibe e instala dependencias
tests/                        suite unittest del puente (checksum, top-k, validación)
```

## Inicio rápido

Requisitos: Python ≥ 3.10 con `pandas` para modo demo. Nada más.

```powershell
git clone https://github.com/Ax3lsk3r3/QuantVibe.git
cd QuantVibe

python -m unittest discover -s tests

# pipeline completo en modo demo (solo hace falta pandas/numpy)
python scripts/run_pipeline.py --force-demo
```

Salidas:

- `artifacts/signals.json` — señales top-k firmadas que consume el agente/MCP
- `artifacts/orders_plan.json` — plan de órdenes paper equal-weight (`dry_run: true`)
- `data/raw/*.csv` — OHLCV por símbolo + procedencia en `manifest.json`

## Setup completo (datos reales + modelo real)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
python scripts/run_pipeline.py
```

| venv | contenido | Python |
|------|-----------|--------|
| `venvs\qlib` | `pyqlib`, `yfinance` | **3.10–3.12 obligatorio** (pyqlib no compila en 3.13+) |
| `venvs\vibe` | `vibe-trading-ai` | 3.11+ |

Sin intérprete compatible para Qlib todo sigue funcionando con el fallback demo — el pipeline indica qué modo usó.

## Conectar el agente de Vibe-Trading

Registra el servidor MCP (ejemplo en `config/mcp.vibe-trading.example.json`; verifica los nombres exactos contra tu versión de Vibe-Trading):

```jsonc
{
  "mcpServers": {
    "quantvibe-signals": {
      "command": "python",
      "args": ["-m", "bridge.mcp_server"],
      "cwd": "<ruta-a-este-repo>"
    }
  }
}
```

Flujo recomendado del agente:

1. `signal_health` — ¿las señales son frescas (< N horas)?
2. `get_latest_signals` — leer ranks/scores y razonar sobre ellos (noticias, riesgo, tamaño).
3. Ejecutar o entregar solo el plan revisado.

## Pasar a real (cuando estés listo)

Por diseño nada llega a un broker implícitamente:

```powershell
$env:VIBE_ALLOW_ORDERS = "1"
python -m vibe_side.execute_signals --submit --order-cmd-template "<CLI de tu broker> {symbol} {qty}"
```

Falta cualquiera de las dos barreras → exit code 2, cero órdenes. Empieza con la cuenta sombra/paper de Vibe-Trading y revisa varias sesiones antes de pensar en dinero real.

## Formato del archivo de señales

```jsonc
{
  "schema_version": 1,
  "generated_at": "2026-08-23T19:33:05+00:00",
  "source_model": "LGBModel",           // o DemoMomentum
  "as_of": "2026-08-21",
  "horizon_days": 1,
  "universe": ["AAPL", "..."],
  "signals": [
    { "instrument": "AAPL", "score": 0.109, "rank": 1 }
  ],
  "metadata": { "data_source": "yfinance", "top_k": 5, "test_window": ["...", "..."] },
  "checksum": "sha256 sobre el JSON canónico"  // verificado por cada consumidor
}
```

## Solución de problemas

- **La instalación de `pyqlib` falla** → estás en Python 3.13/3.14. Crea el venv con `py -3.12` (el setup prueba 3.12/3.11/3.10 automáticamente).
- **`No MCP server runtime found`** → en el entorno que ejecuta el servidor MCP: `pip install "mcp>=1.2,<2"` o `pip install fastmcp`.
- **Rate-limits de yfinance** → los símbolos afectados caen a datos sintéticos y queda declarado en `manifest.json`; borra `data/raw` y reintenta luego para datos limpios.

## Aviso

Software educativo. No es asesoría financiera. Los scores no son predicciones para confiarle dinero; los backtests sobreajustan; los agentes LLM se equivocan. Usa paper trading.

## Licencia

MIT — ver [LICENSE](LICENSE).
