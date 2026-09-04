import React from 'react'
import { Cpu, ShieldCheck, Database, Server, CheckCircle2 } from 'lucide-react'

export const ArchitectureTab: React.FC = () => {
  return (
    <div className="space-y-6 font-mono">
      {/* Architecture Diagram Card */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-dark-600 pb-3 mb-6">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-sm text-white uppercase tracking-wider">
            Arquitectura de Integración Desacoplada
          </h3>
        </div>

        {/* 3 Pillars Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Pillar 1: Qlib Side */}
          <div className="bg-dark-900/90 border border-dark-700 rounded-xl p-5 space-y-3 relative overflow-hidden group hover:border-cyan-500/50 transition">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Cpu className="w-5 h-5" />
              <h4 className="font-bold text-sm">1. Lado Qlib (Cerebro)</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Módulo de Machine Learning cuantitativo. Entrena modelos LightGBM sobre features Alpha158 sin dependencias de ejecución.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-dark-800">
              <li>• <code className="text-cyan-300">prepare_data.py</code>: OHLCV → binario Qlib</li>
              <li>• <code className="text-cyan-300">train_model.py</code>: LGBModel / DemoMomentum</li>
              <li>• <code className="text-cyan-300">evaluate.py</code>: Spearman IC/ICIR gate</li>
              <li>• <code className="text-cyan-300">export_signals.py</code>: Top-k firmado</li>
            </ul>
            <div className="text-[11px] text-cyan-400/80 bg-cyan-950/40 p-2 rounded border border-cyan-900/60 mt-3">
              Entorno: venvs/qlib (Python 3.11/3.12)
            </div>
          </div>

          {/* Pillar 2: Bridge & Contract */}
          <div className="bg-dark-900/90 border border-dark-700 rounded-xl p-5 space-y-3 relative overflow-hidden group hover:border-blue-500/50 transition">
            <div className="flex items-center space-x-2 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="font-bold text-sm">2. Capa Puente & MCP</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Frontera inviolable. Ambas partes nunca se importan. Toda la comunicación ocurre vía contrato firmado por SHA-256 y servidor MCP.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-dark-800">
              <li>• <code className="text-blue-300">signal_store.py</code>: Validación + SHA-256</li>
              <li>• <code className="text-blue-300">mcp_server.py</code>: FastMCP read-only (stdio/SSE)</li>
              <li>• <code className="text-blue-300">track_record.py</code>: SQLite auditoría histórica</li>
              <li>• <code className="text-blue-300">signals.json</code>: Archivo canónico firmado</li>
            </ul>
            <div className="text-[11px] text-blue-400/80 bg-blue-950/40 p-2 rounded border border-blue-900/60 mt-3">
              Entorno: Python base (Cero dependencias pesadas)
            </div>
          </div>

          {/* Pillar 3: Vibe-Trading Side */}
          <div className="bg-dark-900/90 border border-dark-700 rounded-xl p-5 space-y-3 relative overflow-hidden group hover:border-purple-500/50 transition">
            <div className="flex items-center space-x-2 text-purple-400">
              <Server className="w-5 h-5" />
              <h4 className="font-bold text-sm">3. Vibe-Trading (Manos)</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Agente autónomo LLM que consulta el servidor MCP, genera planes de órdenes equal-weight y cuenta con doble guardia de seguridad.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-dark-800">
              <li>• <code className="text-purple-300">execute_signals.py</code>: Plan de órdenes</li>
              <li>• <code className="text-purple-300">orders_plan.json</code>: Órdenes staged</li>
              <li>• Guardia 1: <code className="text-purple-300">--submit</code> explícito</li>
              <li>• Guardia 2: <code className="text-purple-300">VIBE_ALLOW_ORDERS=1</code></li>
            </ul>
            <div className="text-[11px] text-purple-400/80 bg-purple-950/40 p-2 rounded border border-purple-900/60 mt-3">
              Entorno: venvs/vibe (Agente LLM)
            </div>
          </div>
        </div>
      </div>

      {/* MCP Tools & Knowledge Graph Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FastMCP Tools */}
        <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 border-b border-dark-700 pb-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-xs text-white uppercase tracking-wider">
              Herramientas del Servidor FastMCP (bridge/mcp_server.py)
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded bg-dark-900 border border-dark-700 space-y-1">
              <div className="font-bold text-cyan-300">get_latest_signals(top_n: int = 0)</div>
              <div className="text-slate-400">
                Devuelve las señales vigentes firmadas con su checksum. Los agentes LLM consultan esta tool antes de cada decisión.
              </div>
            </div>

            <div className="p-2.5 rounded bg-dark-900 border border-dark-700 space-y-1">
              <div className="font-bold text-cyan-300">list_universe()</div>
              <div className="text-slate-400">
                Retorna la lista de activos monitorizados en el pipeline actual (ej. AAPL, NVDA, TSLA...).
              </div>
            </div>

            <div className="p-2.5 rounded bg-dark-900 border border-dark-700 space-y-1">
              <div className="font-bold text-cyan-300">signal_health()</div>
              <div className="text-slate-400">
                Verifica frescura de las señales, horas de vigencia y si el modelo requiere reentrenamiento.
              </div>
            </div>
          </div>
        </div>

        {/* Code Graphs Status */}
        <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 border-b border-dark-700 pb-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-xs text-white uppercase tracking-wider">
              Grafos de Conocimiento Indexados
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded bg-dark-900 border border-dark-700 flex items-start justify-between">
              <div>
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  CodeGraph (v1.6.0)
                </div>
                <div className="text-slate-400 mt-1">
                  Índice local en <code className="text-slate-200">.codegraph/codegraph.db</code> (207 nodos, 353 aristas).
                  Exploración de contexto instantánea en 1 llamada via <code className="text-cyan-300">codegraph_explore</code>.
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                ACTIVO
              </span>
            </div>

            <div className="p-3 rounded bg-dark-900 border border-dark-700 flex items-start justify-between">
              <div>
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  codebase-memory-mcp (v0.10.8)
                </div>
                <div className="text-slate-400 mt-1">
                  Grafo en <code className="text-slate-200">.codebase-memory/graph.db.zst</code> (287 nodos, 836 aristas, Hybrid LSP).
                  Consultas Cypher, trazabilidad de llamadas y ADR persistido.
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                ACTIVO
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
