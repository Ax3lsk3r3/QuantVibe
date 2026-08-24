# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [0.2.0] - 2026-08-24

### Añadido
- **Gate de evaluación** (`qlib_side/evaluate.py`): IC/ICIR/hit-rate sobre retornos
  futuros; `export` rechaza publicar señales si el modelo reprueba (`--force` para
  saltarlo). Reporte en `artifacts/evaluation.json`.
- **Track record en SQLite** (`bridge/track_record.py`): registro idempotente de
  señales, liquidación con precios disponibles y stats (hit-rate, exceso vs universo).
  Nuevo paso `settle` en el pipeline.
- **Docker**: `Dockerfile` (Python 3.11 + pyqlib, ejecuta los tests durante el build)
  y `docker-compose.yml` con dos servicios: `pipeline` y `signals-mcp` (MCP vía SSE
  en el puerto 8000).
- **CI en GitHub Actions**: tests unitarios en Ubuntu y Windows en cada push;
  badge de estado en el README.

### Cambiado
- El momentum del modo demo ahora genera scores multi-fecha (historia evaluable por
  el gate) y los datos sintéticos usan tendencias autorregresivas en lugar de GBM.
- Servidor MCP configurable por variable `QVB_MCP_TRANSPORT` (stdio/sse).

## [0.1.0] - 2026-08-23

### Añadido
- Puente inicial Qlib → Vibe-Trading: preparación de datos (yfinance o sintético),
  entrenamiento LGBModel con fallback DemoMomentum, exportación de señales firmadas
  con SHA-256, servidor MCP read-only, generación de planes de órdenes paper con
  doble guardia de envío, orquestador end-to-end y suite unittest.
