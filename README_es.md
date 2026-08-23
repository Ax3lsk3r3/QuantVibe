# QuantVibe

[English](README.md) | [EspaÃ±ol](README_es.md)

**Usa [Qlib](https://github.com/microsoft/qlib) como cerebro cuant y [Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) como manos.**

`QuantVibe` es un pequeÃ±o proyecto de integraciÃ³n que conecta dos herramientas
existentes sin hacer fork de ninguna:

- **Qlib** (Microsoft) entrena un modelo ML con datos de mercado y produce scores de acciones.
- **Vibe-Trading** (HKUDS) es un agente de trading basado en LLM que lee esos scores vÃ­a un
  servidor MCP read-only y actÃºa sobre ellos (paper trading primero).

El puente son ~600 lÃ­neas de Python sin dependencias pesadas:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Lado Qlib (venv propio) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€ Lado Vibe-Trading (venv propio) â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                              â”‚      â”‚                                              â”‚
â”‚  prepare_data    OHLCV -> formato Qlib       â”‚      â”‚  Agente LLM (cliente MCP)                    â”‚
â”‚       â†“                                      â”‚ MCP  â”‚       â†“                                      â”‚
â”‚  train_model     LGBModel (o demo fallback)  â”‚â”€â”€â”€â”€â”€â†’â”‚  get_latest_signals()                        â”‚
â”‚       â†“                                      â”‚ stdioâ”‚       â†“                                      â”‚
â”‚  export_signals  top-k + checksum SHA-256    â”‚      â”‚  execute_signals   plan de Ã³rdenes (paper)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚       â†“                                      â”‚
                                                      â”‚  cuenta sombra â†’ broker                      â”‚
                                                      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Los dos mundos **nunca se importan entre sÃ­**: se comunican por un archivo firmado
(`artifacts/signals.json`, a prueba de manipulaciÃ³n vÃ­a checksum) y un servidor MCP stdio.
Cada lado vive en su propio venv, asÃ­ los Ã¡rboles de dependencias nunca chocan.

## CaracterÃ­sticas

- **Demo con un comando** que corre end-to-end sin servicios externos: datos sintÃ©ticos GBM +
  fallback de momentum cuando pyqlib/yfinance no estÃ¡n instalados.
- **Modo real**: descarga yfinance â†’ conversiÃ³n `qlib.scripts.dump_bin` â†’ features Alpha158 â†’
  entrenamiento LGBModel â†’ predicciones.
- **Contrato de seÃ±ales firmado**: validaciÃ³n de esquema, ranking contiguo, scores finitos y
  checksum SHA-256 sobre el JSON canÃ³nico â€” cualquier ediciÃ³n posterior es rechazada.
- **Servidor MCP** (`bridge/mcp_server.py`) con tres tools read-only:
  `get_latest_signals`, `list_universe`, `signal_health` (control de frescura).
- **GuardarraÃ­les de ejecuciÃ³n**: `execute_signals.py` solo escribe un *plan de Ã³rdenes* por
  defecto. Enviar Ã³rdenes reales exige `--submit` Y la variable `VIBE_ALLOW_ORDERS=1`.
- **Trazabilidad de procedencia**: si cada sÃ­mbolo vino de yfinance o del generador sintÃ©tico
  viaja en `manifest.json` â†’ `signals.json`.

## Estructura

```
config/pipeline.json          universo, fechas, segmentos train/valid/test, top_k, notional
config/mcp.vibe-trading.example.json  registro del servidor MCP en el agente Vibe-Trading
bridge/signal_store.py        esquema + validaciÃ³n + checksums (Python puro)
bridge/mcp_server.py          servidor FastMCP stdio (compatible mcp SDK 1.x o fastmcp)
qlib_side/prepare_data.py     yfinance (o sintÃ©tico) -> CSV -> formato binario de Qlib
qlib_side/train_model.py      LGBModel de Qlib; fallback automÃ¡tico DemoMomentum
qlib_side/export_signals.py   predictions.csv -> signals.json verificado
vibe_side/execute_signals.py  seÃ±ales -> plan equal-weight; submit con doble guardia
scripts/run_pipeline.py       orquestador end-to-end (elige el venv correcto por paso)
scripts/setup.ps1             crea venvs\qlib y venvs\vibe e instala dependencias
tests/                        suite unittest del puente (checksum, top-k, validaciÃ³n)
```

## Inicio rÃ¡pido

Requisitos: Python â‰¥ 3.10 con `pandas` para modo demo. Nada mÃ¡s.

```powershell
git clone https://github.com/Ax3lsk3r3/QuantVibe.git
cd QuantVibe

python -m unittest discover -s tests

# pipeline completo en modo demo (solo hace falta pandas/numpy)
python scripts/run_pipeline.py --force-demo
```

Salidas:

- `artifacts/signals.json` â€” seÃ±ales top-k firmadas que consume el agente/MCP
- `artifacts/orders_plan.json` â€” plan de Ã³rdenes paper equal-weight (`dry_run: true`)
- `data/raw/*.csv` â€” OHLCV por sÃ­mbolo + procedencia en `manifest.json`

## Setup completo (datos reales + modelo real)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
python scripts/run_pipeline.py
```

| venv | contenido | Python |
|------|-----------|--------|
| `venvs\qlib` | `pyqlib`, `yfinance` | **3.10â€“3.12 obligatorio** (pyqlib no compila en 3.13+) |
| `venvs\vibe` | `vibe-trading-ai` | 3.11+ |

Sin intÃ©rprete compatible para Qlib todo sigue funcionando con el fallback demo â€” el pipeline
indica quÃ© modo usÃ³.

## Conectar el agente de Vibe-Trading

Registra el servidor MCP (ejemplo en `config/mcp.vibe-trading.example.json`; verifica los
nombres exactos contra tu versiÃ³n de Vibe-Trading):

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

1. `signal_health` â€” Â¿las seÃ±ales son frescas (< N horas)?
2. `get_latest_signals` â€” leer ranks/scores y razonar sobre ellos (noticias, riesgo, tamaÃ±o).
3. Ejecutar o entregar solo el plan revisado.

## Pasar a real (cuando estÃ©s listo)

Por diseÃ±o nada llega a un broker implÃ­citamente:

```powershell
$env:VIBE_ALLOW_ORDERS = "1"
python -m vibe_side.execute_signals --submit --order-cmd-template "<CLI de tu broker> {symbol} {qty}"
```

Falta cualquiera de las dos barreras â†’ exit code 2, cero Ã³rdenes. Empieza con la cuenta
sombra/paper de Vibe-Trading y revisa varias sesiones antes de pensar en dinero real.

## Formato del archivo de seÃ±ales

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
  "checksum": "sha256 sobre el JSON canÃ³nico"  // verificado por cada consumidor
}
```

## SoluciÃ³n de problemas

- **La instalaciÃ³n de `pyqlib` falla** â†’ estÃ¡s en Python 3.13/3.14. Crea el venv con
  `py -3.12` (el setup prueba 3.12/3.11/3.10 automÃ¡ticamente).
- **`No MCP server runtime found`** â†’ en el entorno que ejecuta el servidor MCP:
  `pip install "mcp>=1.2,<2"` o `pip install fastmcp`.
- **Rate-limits de yfinance** â†’ los sÃ­mbolos afectados caen a datos sintÃ©ticos y queda
  declarado en `manifest.json`; borra `data/raw` y reintenta luego para datos limpios.

## Aviso

Software educativo. No es asesorÃ­a financiera. Los scores no son predicciones para confiarle
dinero; los backtests sobreajustan; los agentes LLM se equivocan. Usa paper trading.

## Licencia

MIT â€” ver [LICENSE](LICENSE).
