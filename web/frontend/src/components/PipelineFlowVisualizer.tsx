import React from 'react'
import { motion } from 'framer-motion'
import { Database, Binary, BrainCircuit, ShieldCheck, Lock, Sparkles } from 'lucide-react'

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
    <div className="rounded-3xl p-6 sm:p-7 bg-[#0C0C10] border border-white/[0.08] shadow-2xl relative overflow-hidden">
      {/* Subtle Apple Top Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 relative z-10 border-b border-white/[0.06] pb-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Flujo Operativo Cuantitativo End-to-End</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#D2D2D7] font-mono border border-white/[0.1]">
              Live Topology
            </span>
          </h3>
          <p className="text-xs text-[#86868B] mt-0.5">
            Interacción en tiempo real entre la capa cuantitativa de Qlib, el contrato criptográfico y el agente Vibe-Trading.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#86868B]">
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
              className="bg-[#121216] rounded-2xl p-4 border border-white/[0.08] hover:border-white/20 relative group cursor-default transition-colors shadow-sm"
            >
              {/* Card top icon with titanium finish */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#1A1A20] border border-white/[0.12] flex items-center justify-center text-white shadow-sm">
                  <Icon className="w-4 h-4 text-[#F5F5F7]" />
                </div>
                <span className="text-[10px] font-mono text-[#636366] font-semibold">
                  0{idx + 1}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="text-sm font-semibold text-white tracking-tight">{node.title}</div>
              <div className="text-xs text-[#86868B] truncate mt-0.5">{node.subtitle}</div>

              {/* Status Badge */}
              <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] text-[#86868B]">Estado</span>
                <span className="text-[10px] font-mono font-medium text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
