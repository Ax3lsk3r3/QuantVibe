# QuantVibe

[![CI](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml/badge.svg)](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/Ax3lsk3r3/QuantVibe/badges/coverage-badge.json)](https://github.com/Ax3lsk3r3/QuantVibe/actions/workflows/ci.yml)
[![Code Style: ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19.2+-61DAFB?logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-OKLCH%20Color-38B2AC?logo=tailwindcss&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

🌐 **Idioma / Language:** [Español](README.es.md) • [English](README.md)  
🚀 **Guía de Despliegue en la Nube:** [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)  
🔴 **Demostración en Servidor Activo:** [http://47.85.111.6](http://47.85.111.6)

---

> **Donde el Rigor Cuantitativo se Encuentra con la Ejecución Autónoma.**  
> Plataforma de finanzas cuantitativas de nivel institucional que combina **Microsoft Qlib** (Minería de Factores Alpha158 y LightGBM) con **Agentes LLM Autónomos de Vibe-Trading**, protegidos por barreras criptográficas de importación cero (*zero-import*) y validación por filtros matemáticos (*gate validation*).

---

## 🏛️ Descripción General de la Arquitectura

```
┌───────────────── Qlib Brain (Alpha Estadístico) ────────────────┐
│                                                                 │
│  Data Lake ──> Minería Alpha158 ──> Modelo LightGBM Walk-Forward│
│                                           ↓                     │
│                             Filtro Spearman IC & ICIR (≥ 0.05)  │
│                                           ↓                     │
│                        Bóveda Criptográfica SHA-256             │
└───────────────────────────────────────────┬─────────────────────┘
                                            │
                             BARRERA AIR-GAP (ZERO-IMPORT)
                         (JSON Canónico Firmado + FastMCP Stdio)
                                            │
                                            ▼
┌──────────────── Manos del Agente Vibe (Ejecución y Riesgo) ─────┐
│                                                                 │
│  Cliente MCP ──> Constructor Portafolio ──> Guardián de Riesgo  │
│                                             (Máx 20% por activo)│
│                                             (Neutralidad Sector)│
│                                           ↓                     │
│                          Mesa de Ejecución con Doble Candado    │
│                          (--submit + VIBE_ALLOW_ORDERS=1)       │
└─────────────────────────────────────────────────────────────────┘
```

Los dos sistemas **nunca se importan entre sí**:
- Se comunican exclusivamente a través de un contrato firmado inmutable (`artifacts/signals.json`) validado mediante hashes SHA-256 canónicos y una interfaz FastMCP vía stdio.
- Los entornos de ejecución de Python se mantienen aislados en entornos dedicados para evitar conflictos de dependencias.

---

## ✨ Capacidades Principales

1. **Terminal Web SaaS de Lujo (Arquitectura de Puerto Único)**:
   - Desarrollada con **React 19**, **TypeScript**, **Tailwind CSS** y **Framer Motion**.
   - Sistema de color personalizado **OKLCH** para máxima fidelidad perceptual y elevación glassmórfica profunda.
   - Física de movimiento con resortes (`apple-design`), retroalimentación táctil de pulsación (`better-ui`) y animaciones cinéticas de texto (`animate-text`).
   - **Simulador Interactivo de Portafolio y Laboratorio de Factores Alpha** con recálculo en tiempo real de Sharpe, IC, spread de alpha y restricciones dinámicas de peso.
   - **Visualizador Topológico del Pipeline** con transmisión de registros en vivo mediante Server-Sent Events (SSE).
   - Motor FastAPI de puerto único (`0.0.0.0:8000` o puerto `80`) con soporte nativo de reenvío de puertos para GitHub Codespaces.

2. **Minería Continua de Factores con Microsoft Qlib**:
   - Indicadores cuantitativos continuos Alpha158 (momento, volatilidad, interacción precio-volumen, reversión a la media).
   - Árboles de decisión con gradiente potenciado (*walk-forward* con LightGBM ranker).
   - Sistema de respaldo automático (*fallback*) de momento simulado para ejecuciones sin dependencias pesadas.

3. **Filtro de Control Matemático (Quality Firewall)**:
   - Antes de publicar cualquier señal de trading, el modelo se somete a validación estadística: Coeficiente de Información Spearman ($IC \ge 0.05$), $ICIR \ge 0.50$ y tasa de acierto (*hit rate*).
   - Las señales degradadas se descartan automáticamente antes de llegar a la capa de ejecución.

4. **Bóveda Criptográfica SHA-256 y Cero Fuga de Datos**:
   - Cada paquete de señales está sellado con una suma de verificación SHA-256 canónica.
   - Libro mayor histórico auditado almacenado en SQLite (`artifacts/track_record.db`).

5. **Ejecución con Doble Candado de Riesgo**:
   - Por defecto, el módulo de ejecución solo genera un plan de órdenes en papel (*dry-run* en `orders_plan.json`).
   - El envío real de órdenes al bróker requiere tanto el parámetro `--submit` en la línea de comandos como la variable de entorno explícita `VIBE_ALLOW_ORDERS=1`.

---

## ⚡ Inicio Rápido (En Un Solo Comando)

### Opción 1: Interfaz Web y API (Local o en Codespaces)

```bash
# 1. Clonar el repositorio
git clone https://github.com/Ax3lsk3r3/QuantVibe.git
cd QuantVibe

# 2. Instalar dependencias web ligeras
pip install -r requirements-web.txt

# 3. Iniciar el Terminal Web (Escucha en 0.0.0.0:8000)
python scripts/start_web.py
```

* **Aplicación Web:** `http://localhost:8000`
* **Documentación Interactiva de API (Swagger):** `http://localhost:8000/docs`
* **GitHub Codespaces:** Abre automáticamente el puerto `8000` sin necesidad de configurar CORS.

---

### Opción 2: Pipeline Completo de Extremo a Extremo (Modo Demo)

Se ejecuta sin dependencias externas pesadas (solo requiere `pandas` y `numpy` estándar):

```bash
python scripts/run_pipeline.py --force-demo
```

**Artefactos Generados:**
* `artifacts/evaluation.json` — Veredicto de validación matemática y métricas estadísticas de IC/ICIR.
* `artifacts/signals.json` — Señales de las mejores acciones ($k$) con sello criptográfico SHA-256.
* `artifacts/orders_plan.json` — Plan de ejecución de órdenes en papel con ponderación equiponderada.
* `artifacts/track_record.db` — Libro contable histórico en SQLite para auditoría de rendimiento.

---

### Opción 3: Despliegue en Servidor VPS en la Nube (Producción 24/7)

Consulta nuestro manual completo de despliegue: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

```bash
# En un servidor Ubuntu 22.04 / 24.04:
sudo apt update && sudo apt install -y python3-pip python3-venv git
git clone https://github.com/Ax3lsk3r3/QuantVibe.git
cd QuantVibe
python3 -m venv venv && source venv/bin/activate
pip install -r requirements-web.txt
nohup python scripts/start_web.py --port 80 > web.log 2>&1 &
```

---

## 📁 Estructura del Repositorio

```
├── config/
│   ├── pipeline.json                 # Universo de activos, particiones train/val/test y filtros
│   └── mcp.vibe-trading.example.json # Configuración FastMCP para el Agente Vibe
├── bridge/
│   ├── signal_store.py               # Validación de esquema y sumas de verificación SHA-256
│   ├── mcp_server.py                 # Servidor FastMCP stdio (herramientas de solo lectura)
│   └── track_record.py               # Libro mayor en SQLite y tasa de aciertos histórica
├── qlib_side/
│   ├── prepare_data.py               # Conversor OHLCV -> formato binario de Qlib
│   ├── train_model.py                # Modelo LightGBM Alpha158 y ranker de respaldo
│   ├── evaluate.py                   # Lógica de verificación IC, ICIR y filtros matemáticos
│   └── export_signals.py             # Publicador de señales verificadas
├── vibe_side/
│   └── execute_signals.py            # Constructor del plan de órdenes con doble candado
├── web/
│   ├── api.py                        # Endpoints FastAPI, stream SSE y montaje SPA estático
│   ├── server.py                     # Ejecutor del servidor en producción
│   ├── static/                       # Paquete compilado de producción del frontend
│   └── frontend/                     # React 19 + TypeScript + Tailwind + Framer Motion
│       ├── src/components/
│       │   ├── Header.tsx            # Barra de navegación en vidrio esmerilado
│       │   ├── LandingPage.tsx       # Landing page SaaS de presentación institucional
│       │   ├── OverviewTab.tsx       # Tarjetas holográficas y minigráficos dinámicos
│       │   ├── PipelineTab.tsx       # Cabina de control en vivo y consola SSE
│       │   ├── ExecutionTab.tsx      # Mesa de ejecución con candado e interruptor iOS
│       │   ├── TrackRecordTab.tsx    # Curva de capital SQLite y explorador de métricas
│       │   ├── ArchitectureTab.tsx   # Desglose de los 3 pilares y estado de grafos
│       │   └── landing/              # Títulos cinéticos, simuladores y matriz comparativa
├── docs/
│   └── DEPLOYMENT_GUIDE.md           # Manual de VPS en la nube, Alibaba Cloud ECS y dominios
├── scripts/
│   ├── start_web.py                  # Lanzador del terminal web en un solo comando
│   └── run_pipeline.py               # Orquestador a través de entornos aislados
├── tests/
│   ├── test_bridge.py                # Pruebas de checksum, esquema e integridad de filtros
│   └── test_web.py                   # 24 pruebas unitarias de FastAPI y montaje estático
└── requirements-web.txt              # Dependencias de FastAPI, Uvicorn y Pydantic
```

---

## 🔒 Invariantes de Seguridad y Ejecución Protegida

| Invariante | Mecanismo de Protección | Aplicación |
| :--- | :--- | :--- |
| **Calidad del Modelo** | Filtro IC $\ge 0.05$, ICIR $\ge 0.50$ | Se bloquean las señales si el alpha se ha degradado |
| **Integridad de Carga** | Hash SHA-256 Canónico | Los consumidores descartan JSON modificados o no verificados |
| **Separación de Arquitectura**| Política de Importación Cero | `qlib_side` y `vibe_side` jamás comparten memoria |
| **Concentración de Activos**  | Límite Máximo del 20.0% de Peso | El constructor previene sobreasignación de capital |
| **Seguridad de Bróker**       | Argumento CLI con Doble Candado| La ejecución exige `--submit` Y `VIBE_ALLOW_ORDERS=1` |

---

## 🧪 Batería de Pruebas Automatizadas

QuantVibe incluye pruebas unitarias automatizadas que cubren sumas de verificación criptográficas, consistencia de ranking, filtros matemáticos y endpoints FastAPI:

```bash
# Ejecutar todas las pruebas unitarias
python -m unittest discover -s tests -v
```

Las 29 pruebas se ejecutan en menos de 0.5 segundos con un 100% de éxito limpio.

---

## ⚖️ Descargo de Responsabilidad Legal

*Este software se proporciona exclusivamente con fines de investigación técnica, educativos y de simulación algorítmica. Ninguno de los módulos, predicciones, métricas o señales constituye asesoramiento financiero, tributario o de inversión. Los backtests históricos están sujetos a sesgos de sobreajuste y supervivencia. Valide siempre sus estrategias en cuentas de demostración (paper trading) antes de comprometer capital real.*

---

## 📄 Licencia

Distribuido bajo la [Licencia MIT](LICENSE). Copyright © 2026 Ax3lsk3r3.
