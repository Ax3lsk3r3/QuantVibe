# QuantVibe

[![CI](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml/badge.svg)](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml)
[![Cobertura](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/Ax3lsk3r3/QuantVibe/badges/coverage-badge.json)](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml)
[![Estilo: ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-blue?logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/docker-ghcr.io%2Fax3lsk3r3%2Fquantvibe-2496ED?logo=docker&logoColor=white)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](LICENSE)

Idioma: [English](README.md) | **Español**  
Terminal en Producción: [https://quantvibeapp.com](https://quantvibeapp.com)

**Usa [Qlib](https://github.com/microsoft/qlib) como cerebro cuant y [Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) como manos.**

`QuantVibe` es un proyecto de integración que conecta dos herramientas existentes sin hacer fork de ninguna:

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

Los dos mundos **nunca se importan entre sí**: se comunican por un archivo firmado (`artifacts/signals.json`, a prueba de manipulación vía checksum) y un servidor FastMCP stdio. Cada lado vive en su propio venv, así los árboles de dependencias nunca chocan.

## Características

- **Demo con un comando**: Corre end-to-end sin servicios externos: datos sintéticos con tendencias autorregresivas + fallback de momentum cuando pyqlib/yfinance no están instalados.
- **Modo real**: Descarga yfinance -> conversión `qlib.scripts.dump_bin` -> features Alpha158 -> entrenamiento LGBModel -> predicciones.
- **Contrato de señales firmado**: Validación de esquema, ranking contiguo, scores finitos y checksum SHA-256 sobre el JSON canónico — cualquier edición posterior es rechazada.
- **Gate de evaluación**: Antes de publicar señales se mide IC/ICIR/hit-rate del modelo sobre retornos futuros; si reprueba, `signals.json` no se escribe (salvo `--force`).
- **Track record en SQLite**: Cada señal publicada se registra y se liquida con precios reales cuando existen; `stats` muestra hit-rate y exceso vs universo.
- **Servidor FastMCP** (`bridge/mcp_server.py`): Tres herramientas de solo lectura: `get_latest_signals`, `list_universe`, `signal_health` (control de frescura).
- **Guardarraíles de ejecución**: `execute_signals.py` solo escribe un *plan de órdenes* por defecto. Enviar órdenes reales exige `--submit` Y la variable `VIBE_ALLOW_ORDERS=1`.
- **Trazabilidad de procedencia**: Si cada símbolo vino de yfinance o del generador sintético viaja en `manifest.json` -> `signals.json`.

## Estructura

```
config/pipeline.json                 universo, fechas, segmentos train/valid/test, top_k, notional
config/mcp.vibe-trading.example.json registro del servidor MCP en el agente Vibe-Trading
bridge/signal_store.py               esquema + validación + checksums (Python puro)
bridge/mcp_server.py                 servidor FastMCP stdio (compatible mcp SDK 1.x o fastmcp)
bridge/track_record.py               registro histórico de señales en SQLite (log/settle/stats)
qlib_side/prepare_data.py            yfinance (o sintético) -> CSV -> formato binario de Qlib
qlib_side/train_model.py             LGBModel de Qlib; fallback automático DemoMomentum
qlib_side/evaluate.py                IC/ICIR/hit-rate + gate de publicación
qlib_side/export_signals.py          predictions.csv -> evaluación -> signals.json verificado
vibe_side/execute_signals.py         señales -> plan equal-weight; submit con doble guardia
web/api.py                           API REST FastAPI, stream SSE y montaje SPA estático
web/server.py                        ejecutor del servidor web en producción
web/static/                          paquete compilado de producción del frontend
web/frontend/                        React 19 + TypeScript + Tailwind + Framer Motion
docs/DEPLOYMENT_GUIDE.md             manual de operaciones y despliegue en la nube
scripts/start_web.py                 lanzador web en un solo comando (puerto único: 8000 o 80)
scripts/run_pipeline.py              orquestador end-to-end a través de venvs aislados
scripts/setup.ps1                    crea venvs\qlib y venvs\vibe e instala dependencias
Dockerfile                           imagen Python 3.11 con pyqlib; corre los tests en el build
```

Artefactos generados:
- `artifacts/signals.json` — señales top-k firmadas que consume el agente/MCP
- `artifacts/orders_plan.json` — plan de órdenes paper equal-weight (`dry_run: true`)
- `artifacts/track_record.db` — histórico de señales para medir el hit-rate real
- `data/raw/*.csv` — OHLCV por símbolo + procedencia en `manifest.json`

Pasos del pipeline: `prepare -> settle -> train -> export -> execute`.
El paso `settle` liquida las señales de días anteriores con los precios ya disponibles.

## Interfaz Web y Terminal (Codespaces, Local & Servidor Cloud)

QuantVibe incluye una interfaz web estilo terminal fintech montada con FastAPI y React/Tailwind/TypeScript, diseñada para operar tanto en local como en **GitHub Codespaces** y servidores remotos en un único puerto unificado (por defecto `8000`, o puerto `80`).

### Iniciar la Interfaz Web

```bash
# 1. Instalar dependencias web ligeras
pip install -r requirements-web.txt

# 2. Iniciar el servidor web (escucha en 0.0.0.0:8000 para Codespaces)
python scripts/start_web.py
```

- **Local / Codespaces URL:** `http://localhost:8000`
- **Swagger API Docs:** `http://localhost:8000/docs`

### Características de la Interfaz

1. **Dashboard & Gate de Calidad:** Semáforo del veredicto del modelo (IC, ICIR, hit-rate), verificación criptográfica SHA-256 en tiempo real y tabla interactiva de señales Top-$k$.
2. **Lanzador de Pipeline Interactivo:** Selector de modo (Demo vs Qlib Real), selección granular de fases y consola con streaming en tiempo real vía Server-Sent Events (SSE).
3. **Mesa de Órdenes & Guardarraíles:** Visualizador del plan de órdenes (`orders_plan.json`), cálculo de exposición y switch de seguridad para alternar entre Paper Trading y envío real (`VIBE_ALLOW_ORDERS=1`).
4. **Track Record & Auditoría:** Rendimiento histórico asentado en SQLite (`artifacts/track_record.db`), hit-rate real y exceso frente al universo.
5. **Arquitectura & MCP Inspector:** Estado de los servidores FastMCP y grafos de conocimiento indexados.

### Desarrollo del Frontend

El frontend vive en `web/frontend/` y compila estáticamente a `web/static/` (servido automáticamente por FastAPI):

```bash
cd web/frontend
pnpm install
pnpm build     # compila a web/static/
pnpm dev       # servidor dev Vite en puerto 5173 con proxy hacia FastAPI :8000
```

## Gate de evaluación y track record

Antes de publicar, `export` evalúa el modelo: correlación de Spearman (IC) entre scores y retornos futuros por fecha, ICIR (IC/volatilidad del IC) y hit-rate del top-k. Los umbrales están en `config/pipeline.json -> evaluation.gate`. Si reprueba, no se publican señales (`--force` para saltarlo conscientemente).

Con el tiempo, consulta el rendimiento real:

```bash
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

Resuelve de raíz el problema de versiones de Python: la imagen usa 3.11, donde `pyqlib` compila sin problemas, y los tests corren como parte del build.

```bash
docker compose build                      # construye la imagen (ejecuta tests)
docker compose run --rm pipeline          # pipeline completo con datos/modelo reales
docker compose up -d signals-mcp          # MCP vía SSE en http://localhost:8000/sse
```

También hay una imagen preconstruida en GitHub Container Registry, publicada automáticamente con cada cambio en `main`:

```bash
docker pull ghcr.io/ax3lsk3r3/quantvibe:latest
docker run --rm -v ./data:/app/data -v ./artifacts:/app/artifacts ghcr.io/ax3lsk3r3/quantvibe:latest python scripts/run_pipeline.py --force-demo
```

`./data` y `./artifacts` están montados como volúmenes: las señales, planes y la base del track record quedan en tu disco, no dentro del contenedor.

## Despliegue en la Nube (Producción 24/7)

Para desplegar QuantVibe en un servidor en la nube (Alibaba Cloud ECS, AWS EC2, DigitalOcean, etc.):

Consulta el manual de operaciones paso a paso: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

```bash
# En un servidor Ubuntu 22.04 / 24.04:
sudo apt update && sudo apt install -y python3-pip python3-venv git
git clone https://github.com/Ax3lsk3r3/QuantVibe.git
cd QuantVibe
python3 -m venv venv && source venv/bin/activate
pip install -r requirements-web.txt
nohup python scripts/start_web.py --port 80 > web.log 2>&1 &
```

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

```bash
# Windows PowerShell
$env:VIBE_ALLOW_ORDERS = "1"
python -m vibe_side.execute_signals --submit --order-cmd-template "<CLI de tu broker> {symbol} {qty}"

# Linux / macOS
export VIBE_ALLOW_ORDERS=1
python -m vibe_side.execute_signals --submit --order-cmd-template "<CLI de tu broker> {symbol} {qty}"
```

Falta cualquiera de las dos barreras -> exit code 2, cero órdenes. Empieza con la cuenta sombra/paper de Vibe-Trading y revisa varias sesiones antes de pensar en dinero real.

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

- **La instalación de `pyqlib` falla**: Estás en Python 3.13/3.14. Crea el venv con `py -3.12` (el setup prueba 3.12/3.11/3.10 automáticamente).
- **`No MCP server runtime found`**: En el entorno que ejecuta el servidor MCP: `pip install "mcp>=1.2,<2"` o `pip install fastmcp`.
- **Rate-limits de yfinance**: Los símbolos afectados caen a datos sintéticos y queda declarado en `manifest.json`; borra `data/raw` y reintenta luego para datos limpios.

## Comunidad

- [Contribuir](CONTRIBUTING.md) — cómo reportar bugs y proponer cambios
- [Reportar una vulnerabilidad](SECURITY.md)
- [Issues](https://github.com/Ax3lsk3r3/QuantVibe/issues) — plantillas para bug e idea

## Aviso Legal y Descargo de Responsabilidad

Este software tiene fines estrictamente educativos, experimentales y de investigación técnica. Ninguno de los módulos, códigos, señales, métricas o análisis generados por este sistema constituye, ni debe interpretarse como, asesoría financiera, tributaria, legal o recomendación de inversión.

- **Riesgo del Modelado Predictivo**: Los scores y clasificaciones producidos por modelos cuantitativos y algoritmos de Machine Learning son estimaciones estadísticas basadas en datos históricos. No garantizan rendimientos futuros ni representan certeza operativa en mercados reales.
- **Sobreajuste (Overfitting)**: Los resultados obtenidos en entornos de backtesting presentan sesgos inherentes al ajuste histórico de parámetros y no reflejan con exactitud las condiciones de liquidez, comisiones, deslizamiento (slippage) ni la volatilidad de un mercado en vivo.
- **Comportamiento de Modelos de Lenguaje (LLMs)**: Las decisiones y evaluaciones generadas por agentes basados en LLM pueden incurrir en alucinaciones, sesgos contextuales o razonamientos erróneos frente a dinámicas complejas del mercado.
- **Uso Exclusivo en Simulación**: Se aconseja operar únicamente en cuentas sombra, entornos de prueba (paper trading) o simuladores de riesgo cero. Cualquier despliegue con capital real es responsabilidad única y exclusiva del usuario final.

## Licencia

Distribuido bajo la [Licencia MIT](LICENSE).
