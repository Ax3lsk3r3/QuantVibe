import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, ShieldCheck, Database, Server, CheckCircle2, Sparkles, Binary } from 'lucide-react'

export const ArchitectureTab: React.FC = () => {
  return (
    <div className="space-y-8 font-sans">
      {/* Visual Integration Architecture Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0C0C10] border border-white/[0.09] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

        <div className="flex items-center space-x-3.5 border-b border-white/[0.08] pb-6 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#F5F5F7] tracking-[-0.03em]">
              Topología de Integración Desacoplada
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              Arquitectura de cero acoplamiento (Zero-Import IPC) uniendo Machine Learning y Agentes Autónomos.
            </p>
          </div>
        </div>

        {/* 3 Pillars Visualization with Apple Device Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Pillar 1: Qlib Side */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="rounded-2xl p-6 bg-[#121216] border border-white/[0.08] hover:border-white/[0.2] space-y-4 relative overflow-hidden transition-all shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white flex items-center justify-center font-bold">
                <Binary className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.06] text-[#D1D1D6] border border-white/[0.1] font-semibold">
                venvs/qlib
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-[#F5F5F7] tracking-tight">1. Qlib ML Brain</h4>
              <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                Computación cuantitativa pesada. Ingesta de OHLCV, extracción de factores Alpha158 y entrenamiento con LightGBM.
              </p>
            </div>

            <div className="space-y-2 pt-3.5 border-t border-white/[0.06] text-xs font-mono text-[#D1D1D6]">
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span>prepare_data.py</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span>train_model.py (LGBModel)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span>evaluate.py (Gate IC/ICIR)</span>
              </div>
            </div>
          </motion.div>

          {/* Pillar 2: Bridge Layer */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="rounded-2xl p-6 bg-[#121216] border border-white/[0.08] hover:border-white/[0.2] space-y-4 relative overflow-hidden transition-all shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.06] text-[#D1D1D6] border border-white/[0.1] font-semibold">
                Bridge IPC
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-[#F5F5F7] tracking-tight">2. Bóveda Criptográfica & MCP</h4>
              <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                Contrato firmado con SHA-256 canónico inmutable y servidor FastMCP read-only para consumo del agente.
              </p>
            </div>

            <div className="space-y-2 pt-3.5 border-t border-white/[0.06] text-xs font-mono text-[#D1D1D6]">
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span>signal_store.py (Hash SHA-256)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span>mcp_server.py (FastMCP SDK)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span>track_record.py (SQLite Ledger)</span>
              </div>
            </div>
          </motion.div>

          {/* Pillar 3: Vibe-Trading Side */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="rounded-2xl p-6 bg-[#121216] border border-white/[0.08] hover:border-white/[0.2] space-y-4 relative overflow-hidden transition-all shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.06] text-[#D1D1D6] border border-white/[0.1] font-semibold">
                venvs/vibe
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-[#F5F5F7] tracking-tight">3. Vibe-Trading Agent</h4>
              <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                Agente LLM que lee las señales vía MCP, calcula la asignación de capital y supervisa los guardarraíles de ejecución.
              </p>
            </div>

            <div className="space-y-2 pt-3.5 border-t border-white/[0.06] text-xs font-mono text-[#D1D1D6]">
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span>execute_signals.py</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span>orders_plan.json (Staged)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span>Guardia: VIBE_ALLOW_ORDERS</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Code Graphs Status & FastMCP Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Knowledge Graphs Card */}
        <div className="rounded-3xl p-6 sm:p-7 bg-[#0C0C10] border border-white/[0.09] shadow-2xl space-y-5 relative overflow-hidden">
          <div className="flex items-center space-x-3.5 border-b border-white/[0.08] pb-4">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#F5F5F7] text-base tracking-tight">Grafos de Código Indexados</h4>
              <p className="text-xs text-[#86868B]">Motores MCP listos para cualquier sesión futura de agentes IA.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#121216] border border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#F5F5F7] text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
                  CodeGraph (v1.6.0)
                </div>
                <div className="text-xs text-[#86868B] mt-1">
                  Índice local en <code className="text-[#D1D1D6] font-mono">.codegraph/codegraph.db</code> • 958 nodos, 4,875 aristas.
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
                ACTIVO
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121216] border border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#F5F5F7] text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
                  codebase-memory-mcp (v0.10.8)
                </div>
                <div className="text-xs text-[#86868B] mt-1">
                  Grafo en <code className="text-[#D1D1D6] font-mono">.codebase-memory/graph.db.zst</code> • 1,040 nodos, 4,281 aristas.
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
                ACTIVO
              </span>
            </div>
          </div>
        </div>

        {/* FastMCP Tools Card */}
        <div className="rounded-3xl p-6 sm:p-7 bg-[#0C0C10] border border-white/[0.09] shadow-2xl space-y-5 relative overflow-hidden">
          <div className="flex items-center space-x-3.5 border-b border-white/[0.08] pb-4">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#F5F5F7] text-base tracking-tight">Herramientas FastMCP Activas</h4>
              <p className="text-xs text-[#86868B]">Expuestas en modo stdio y SSE para el agente LLM.</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-[#121216] border border-white/[0.08] space-y-1">
              <div className="font-bold text-[#F5F5F7]">get_latest_signals(top_n: int = 0)</div>
              <p className="text-[#86868B] font-sans text-xs">
                Entrega el lote de señales validadas con su checksum SHA-256.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#121216] border border-white/[0.08] space-y-1">
              <div className="font-bold text-[#F5F5F7]">list_universe()</div>
              <p className="text-[#86868B] font-sans text-xs">
                Retorna la lista de activos monitorizados en la cartera (AAPL, NVDA, TSLA, etc.).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#121216] border border-white/[0.08] space-y-1">
              <div className="font-bold text-[#F5F5F7]">signal_health()</div>
              <p className="text-[#86868B] font-sans text-xs">
                Monitorea horas de vigencia y determina si las señales requieren refresco.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
