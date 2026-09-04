import React from 'react'
import { motion } from 'framer-motion'
import { Database, Binary, BrainCircuit, ShieldCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react'

interface PipelineFlowVisualizerProps {
  isRunning: boolean
  gatePassed: boolean
  isVerified: boolean
}

export const PipelineFlowVisualizer: React.FC<PipelineFlowVisualizerProps> = ({
  isRunning,
  gatePassed,
  isVerified,
}) => {
  const nodes = [
    {
      id: 'data',
      title: 'Data Lake',
      subtitle: 'OHLCV & yfinance',
      icon: Database,
      color: 'from-blue-500 to-cyan-500',
      status: 'Ready',
    },
    {
      id: 'features',
      title: 'Alpha158',
      subtitle: 'Factor Library',
      icon: Binary,
      color: 'from-cyan-500 to-teal-500',
      status: 'Ready',
    },
    {
      id: 'ml',
      title: 'Qlib Brain',
      subtitle: 'LightGBM Ranker',
      icon: BrainCircuit,
      color: 'from-violet-500 to-indigo-500',
      status: isRunning ? 'Processing' : 'Active',
    },
    {
      id: 'gate',
      title: 'Gate IC/ICIR',
      subtitle: gatePassed ? 'Statistical Edge' : 'Fail-Closed',
      icon: ShieldCheck,
      color: gatePassed ? 'from-emerald-500 to-teal-500' : 'from-rose-500 to-amber-500',
      status: gatePassed ? 'Passed' : 'Pending',
    },
    {
      id: 'vault',
      title: 'SHA-256 Vault',
      subtitle: 'Canonical Tamper-Proof',
      icon: Lock,
      color: 'from-cyan-500 to-blue-600',
      status: isVerified ? 'Verified' : 'Unsigned',
    },
    {
      id: 'vibe',
      title: 'Vibe Agent',
      subtitle: 'LLM Execution Hands',
      icon: Sparkles,
      color: 'from-fuchsia-500 to-pink-500',
      status: 'Standby',
    },
  ]

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 relative z-10 border-b border-white/[0.06] pb-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Flujo Operativo Cuantitativo End-to-End</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20">
              Live Topology
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interacción en tiempo real entre la capa cuantitativa de Qlib, el contrato criptográfico y el agente Vibe-Trading.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Frecuencia: Diaria</span>
        </div>
      </div>

      {/* Nodes and Flow Connectors */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
        {nodes.map((node, idx) => {
          const Icon = node.icon

          return (
            <motion.div
              key={node.id}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="glass-card rounded-xl p-3.5 border border-white/[0.08] relative group cursor-default"
            >
              {/* Card top icon with gradient */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${node.color} flex items-center justify-center text-white shadow-lg`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                  0{idx + 1}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="text-sm font-bold text-white tracking-tight">{node.title}</div>
              <div className="text-xs text-slate-400 truncate mt-0.5">{node.subtitle}</div>

              {/* Status Badge */}
              <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Estado</span>
                <span className="text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {node.status}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
