import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, ShieldCheck, Database, Server, CheckCircle2, Sparkles, Binary } from 'lucide-react'

export const ArchitectureTab: React.FC = () => {
  return (
    <div className="space-y-8 font-sans">
      {/* Visual Integration Architecture Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-3 border-b border-white/[0.08] pb-5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Topología de Integración Desacoplada
            </h3>
            <p className="text-xs text-slate-400">
              Arquitectura de cero acoplamiento (Zero-Import IPC) uniendo Machine Learning y Agentes Autónomos.
            </p>
          </div>
        </div>

        {/* 3 Pillars Visualization with Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Pillar 1: Qlib Side */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card-interactive rounded-2xl p-6 border border-white/[0.08] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
                <Binary className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                venvs/qlib
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white tracking-tight">1. Qlib ML Brain</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Computación cuantitativa pesada. Ingesta de OHLCV, extracción de factores Alpha158 y entrenamiento con LightGBM.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs font-mono text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>prepare_data.py</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>train_model.py (LGBModel)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>evaluate.py (Gate IC/ICIR)</span>
              </div>
            </div>
          </motion.div>

          {/* Pillar 2: Bridge Layer */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card-interactive rounded-2xl p-6 border border-white/[0.08] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 font-semibold">
                Bridge IPC
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white tracking-tight">2. Bóveda Criptográfica & MCP</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Contrato firmado con SHA-256 canónico inmutable y servidor FastMCP read-only para consumo del agente.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs font-mono text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>signal_store.py (Hash SHA-256)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>mcp_server.py (FastMCP SDK)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>track_record.py (SQLite Ledger)</span>
              </div>
            </div>
          </motion.div>

          {/* Pillar 3: Vibe-Trading Side */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card-interactive rounded-2xl p-6 border border-white/[0.08] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold">
                venvs/vibe
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white tracking-tight">3. Vibe-Trading Agent</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Agente LLM que lee las señales vía MCP, calcula la asignación de capital y supervisa los guardarraíles de ejecución.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs font-mono text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>execute_signals.py</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>orders_plan.json (Staged)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Guardia: VIBE_ALLOW_ORDERS</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Code Graphs Status & FastMCP Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Knowledge Graphs Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/[0.08] shadow-2xl space-y-5">
          <div className="flex items-center space-x-3 border-b border-white/[0.08] pb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Grafos de Código Indexados</h4>
              <p className="text-xs text-slate-400">Motores MCP listos para cualquier sesión futura de agentes IA.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl glass-card border border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  CodeGraph (v1.6.0)
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Índice local en <code className="text-cyan-300">.codegraph/codegraph.db</code> • 958 nodos, 4,875 aristas.
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ACTIVO
              </span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  codebase-memory-mcp (v0.10.8)
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Grafo en <code className="text-cyan-300">.codebase-memory/graph.db.zst</code> • 1,040 nodos, 4,281 aristas, Hybrid LSP.
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ACTIVO
              </span>
            </div>
          </div>
        </div>

        {/* FastMCP Tools Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/[0.08] shadow-2xl space-y-5">
          <div className="flex items-center space-x-3 border-b border-white/[0.08] pb-4">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Herramientas FastMCP Activas</h4>
              <p className="text-xs text-slate-400">Expuestas en modo stdio y SSE para el agente LLM.</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <div className="font-bold text-cyan-300">get_latest_signals(top_n: int = 0)</div>
              <p className="text-slate-400 font-sans text-xs">
                Entrega el lote de señales validadas con su checksum SHA-256.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <div className="font-bold text-cyan-300">list_universe()</div>
              <p className="text-slate-400 font-sans text-xs">
                Retorna la lista de activos monitorizados en la cartera (AAPL, NVDA, TSLA, etc.).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <div className="font-bold text-cyan-300">signal_health()</div>
              <p className="text-slate-400 font-sans text-xs">
                Monitorea horas de vigencia y determina si las señales requieren refresco.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
