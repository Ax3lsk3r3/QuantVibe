# QuantVibe

[![CI](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml/badge.svg)](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml)
[![Cobertura](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/Ax3lsk3r3/QuantVibe/badges/coverage-badge.json)](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml)
[![Estilo: ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-blue?logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/docker-ghcr.io%2Fax3lsk3r3%2Fquantvibe-2496ED?logo=docker&logoColor=white)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](LICENSE)

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

- **Demo con un comando** que corre end-to-end sin servicios externos: datos sintéticos con tendencias autorregresivas + fallback de momentum cuando pyqlib/yfinance no están instalados.
- **Modo real**: descarga yfinance → conversión `qlib.scripts.dump_bin` → features Alpha158 → entrenamiento LGBModel → predicciones.
- **Contrato de señales firmado**: validación de esquema, ranking contiguo, scores finitos y checksum SHA-256 sobre el JSON canónico — cualquier edición posterior es rechazada.
- **Gate de evaluación**: antes de publicar señales se mide IC/ICIR/hit-rate del modelo sobre retornos futuros; si reprueba, `signals.json` no se escribe (salvo `--force`).
- **Track record en SQLite**: cada señal publicada se registra y se liquida con precios reales cuando existen; `stats` muestra hit-rate y exceso vs universo.
- **Servidor MCP** (`bridge/mcp_server.py`) con tres tools read-only: `get_latest_signals`, `list_universe`, `signal_health` (control de frescura).
- **Guardarraíles de ejecución**: `execute_signals.py` solo escribe un *plan de órdenes* por defecto. Enviar órdenes reales exige `--submit` Y la variable `VIBE_ALLOW_ORDERS=1`.
- **Trazabilidad de procedencia**: si cada símbolo vino de yfinance o del generador sintético viaja en `manifest.json` → `signals.json`.

## Estructura

```
config/pipeline.json          universo, fechas, segmentos train/valid/test, top_k, notional
config/mcp.vibe-trading.example.json  registro del servidor MCP en el agente Vibe-Trading
bridge/signal_store.py        esquema + validación + checksums (Python puro)
bridge/mcp_server.py          servidor FastMCP stdio (compatible mcp SDK 1.x o fastmcp)
bridge/track_record.py        registro histórico de señales en SQLite (log/settle/stats)
qlib_side/prepare_data.py     yfinance (o sintético) -> CSV -> formato binario de Qlib
qlib_side/train_model.py      LGBModel de Qlib; fallback automático DemoMomentum
qlib_side/evaluate.py         IC/ICIR/hit-rate + gate de publicación
qlib_side/export_signals.py   predictions.csv -> evaluación -> signals.json verificado
vibe_side/execute_signals.py  señales -> plan equal-weight; submit con doble guardia
scripts/run_pipeline.py       orquestador end-to-end (elige el venv correcto por paso)
scripts/setup.ps1             crea venvs\qlib y venvs\vibe e instala dependencias
Dockerfile                    imagen Python 3.11 con pyqlib; corre los tests en el build
docker-compose.yml            servicios pipeline + signals-mcp (MCP vía SSE :8000)
vendor/dump_bin.py            script oficial de microsoft/qlib (MIT) para convertir CSVs;
                              el wheel de PyPI no lo incluye — ver vendor/README.md
CHANGELOG.md                  historial de versiones
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

- `artifacts/evaluation.json` — métricas del modelo (IC, ICIR, hit-rate) y veredicto del gate
- `artifacts/signals.json` — señales top-k firmadas que consume el agente/MCP
- `artifacts/orders_plan.json` — plan de órdenes paper equal-weight (`dry_run: true`)
- `artifacts/track_record.db` — histórico de señales para medir el hit-rate real
- `data/raw/*.csv` — OHLCV por símbolo + procedencia en `manifest.json`

Pasos del pipeline: `prepare → settle → train → export → execute`.
El paso `settle` liquida las señales de días anteriores con los precios ya disponibles.

## Gate de evaluación y track record

Antes de publicar, `export` evalúa el modelo: correlación de Spearman (IC) entre scores y
retornos futuros por fecha, ICIR (IC/volatilidad del IC) y hit-rate del top-k. Los umbrales
están en `config/pipeline.json → evaluation.gate`. Si reprueba, no se publican señales
(`--force` para saltarlo conscientemente).

Con el tiempo, consulta el rendimiento real:

```powershell
python -m bridge.track_record stats     # hit-rate, retorno medio, exceso vs universo
python -m bridge.track_record settle    # liquida pendientes con precios nuevos
```

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

## Docker (alternativa a los venvs)

Resuelve de raíz el problema de versiones de Python: la imagen usa 3.11, donde `pyqlib`
compila sin problemas, y los tests corren como parte del build.

```powershell
docker compose build                      # construye la imagen (ejecuta tests)
docker compose run --rm pipeline          # pipeline completo con datos/modelo reales
docker compose up -d signals-mcp          # MCP vía SSE en http://localhost:8000/sse
```

También hay una imagen preconstruida en GitHub Container Registry, publicada
automáticamente con cada cambio en `main`:

```bash
docker pull ghcr.io/ax3lsk3r3/quantvibe:latest
docker run --rm -v ./data:/app/data -v ./artifacts:/app/artifacts ghcr.io/ax3lsk3r3/quantvibe:latest python scripts/run_pipeline.py --force-demo
```

`./data` y `./artifacts` están montados como volúmenes: las señales, planes y la base
del track record quedan en tu disco, no dentro del contenedor. Para apuntar cualquier
cliente MCP remoto al servidor: URL `http://localhost:8000/sse`.

## Comunidad

- [Contribuir](CONTRIBUTING.md) — cómo reportar bugs y proponer cambios
- [Reportar una vulnerabilidad](SECURITY.md)
- [Issues](https://github.com/Ax3lsk3r3/QuantVibe/issues) — plantillas para bug e idea

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

Aviso Legal y Descargo de Responsabilidad 

Este software tiene fines estrictamente educativos, experimentales y de investigación técnica. Ninguno de los módulos, códigos, señales, métricas o análisis generados por este sistema constituye, ni debe interpretarse como, asesoría financiera, tributaria, legal o recomendación de inversión.

Riesgo del Modelado Predictivo: Los scores y clasificaciones producidos por modelos cuantitativos y algoritmos de Machine Learning son estimaciones estadísticas basadas en datos históricos. No garantizan rendimientos futuros ni representan certeza operativa en mercados reales.

Sobreajuste (Overfitting): Los resultados obtenidos en entornos de backtesting presentan sesgos inherentes al ajuste histórico de parámetros y no reflejan con exactitud las condiciones de liquidez, comisiones, deslizamiento (slippage) ni la volatilidad de un mercado en vivo.

Comportamiento de Modelos de Lenguaje (LLMs): Las decisiones y evaluaciones generadas por agentes basados en LLM pueden incurrir en alucinaciones, sesgos contextuales o razonamientos erróneos frente a dinámicas complejas del mercado.

Uso Exclusivo en Simulación: Se aconseja operar únicamente en cuentas sombra, entornos de prueba (paper trading) o simuladores de riesgo cero. Cualquier despliegue con capital real es responsabilidad única y exclusiva del usuario final.

## Licencia

MIT — ver [LICENSE](LICENSE).
