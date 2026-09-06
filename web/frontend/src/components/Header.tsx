import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Layers,
  Terminal,
  TrendingUp,
  Cpu,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Monitor,
  Check,
  Zap,
} from 'lucide-react'
import type { SystemStatus, EvaluationData, SignalsResponse } from '../types'

interface HeaderProps {
  status: SystemStatus | null
  evaluation: EvaluationData | null
  signals: SignalsResponse | null
  loading: boolean
  onRefresh: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Header: React.FC<HeaderProps> = ({
  status,
  evaluation,
  signals,
  loading,
  onRefresh,
  activeTab,
  setActiveTab,
}) => {
  const [copiedHash, setCopiedHash] = useState(false)
  const isPipelineRunning = status?.pipeline.is_running ?? false
  const isVerified = signals?.verified ?? false
  const gatePassed = evaluation?.passed ?? false

  const handleCopyChecksum = () => {
    if (signals?.checksum) {
      navigator.clipboard.writeText(signals.checksum)
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2000)
    }
  }

  const tabs = [
    { id: 'landing', label: 'Showcase Institucional', icon: Sparkles },
    { id: 'overview', label: 'Alpha Studio', icon: Activity },
    { id: 'bloomberg', label: 'Terminal Bloomberg', icon: Monitor },
    { id: 'pipeline', label: 'Pipeline de Factores', icon: Terminal },
    { id: 'execution', label: 'Mesa de Órdenes', icon: Layers },
    { id: 'trackrecord', label: 'Auditoría Histórica', icon: TrendingUp },
    { id: 'architecture', label: 'Arquitectura & MCP', icon: Cpu },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#000000]/80 backdrop-blur-3xl transition-all shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-20 py-3">
          {/* Brand Mark: Apple Flagship Luxury */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3.5 cursor-pointer group select-none"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="relative w-10 h-10 rounded-2xl bg-gradient-to-b from-[#1E1E24] to-[#0A0A0E] border border-white/[0.16] shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.25)] flex items-center justify-center text-white group-hover:border-white/40 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  Quant<span className="text-[#8E8E93] group-hover:text-white transition-colors">Vibe</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase rounded-full bg-white/[0.08] text-[#D2D2D7] border border-white/[0.16] shadow-sm">
                  PRO TERMINAL
                </span>
              </div>
              <p className="text-[11px] text-[#86868B] font-mono hidden sm:block tracking-tight">
                Qlib ML Brain × Autonomous Vibe Hands
              </p>
            </div>
          </div>

          {/* Center Navigation: Apple Glass Pill Bar */}
          <nav className="hidden xl:flex items-center p-1.5 rounded-full bg-[#0C0C10]/90 border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-tight transition-colors apple-press ${
                    isActive ? 'text-white' : 'text-[#86868B] hover:text-[#F5F5F7]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      transition={{ type: 'spring', stiffness: 440, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/[0.18] shadow-[0_2px_12px_rgba(255,255,255,0.05)]"
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-white' : 'text-[#86868B]'}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right Status Indicators & Action Bar */}
          <div className="flex items-center space-x-2.5">
            {/* Model Gate Quality Pill */}
            <div
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition-all ${
                gatePassed
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/25'
              }`}
              title={
                evaluation
                  ? `Mean IC: ${(evaluation.mean_ic * 100).toFixed(2)}% | ICIR: ${evaluation.icir.toFixed(3)} | N=${evaluation.n_days} días`
                  : 'Gate Evaluado'
              }
            >
              <span className={`w-1.5 h-1.5 rounded-full ${gatePassed ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-[11px] font-semibold">
                GATE: {gatePassed ? 'PASS (IC≥0.00)' : 'FAIL'}
              </span>
            </div>

            {/* Interactive Cryptographic SHA-256 Pill */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyChecksum}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono border bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.12] text-[#F5F5F7] transition-all cursor-pointer group/sha"
              title="Click para copiar firma SHA-256 canónica"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white/80 group-hover/sha:text-emerald-400 transition-colors" />
              <span className="text-[11px] text-[#A1A1A6] group-hover/sha:text-white">
                {copiedHash ? 'HASH COPIADO' : isVerified ? 'SHA-256 OK' : 'FIRMA PENDIENTE'}
              </span>
              {copiedHash ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <span className="w-1 h-1 rounded-full bg-white/40" />
              )}
            </motion.button>

            {/* FastMCP / Engine Live Indicator */}
            <div
              className={`hidden 2xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono border bg-white/[0.03] border-white/[0.08] text-[#86868B]`}
              title="Servidor FastMCP stdio/SSE activo"
            >
              <Zap className="w-3 h-3 text-white/70" />
              <span className="text-[10px]">FastMCP 1.0</span>
            </div>

            {/* Pipeline Status Indicator */}
            <div
              className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono border ${
                isPipelineRunning
                  ? 'bg-white/[0.1] text-white border-white/30 animate-pulse shadow-sm'
                  : 'bg-white/[0.03] text-[#86868B] border-white/[0.08]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPipelineRunning ? 'bg-emerald-400 animate-ping' : 'bg-[#636366]'
                }`}
              />
              <span className="text-[10px] tracking-wider">{isPipelineRunning ? 'RUNNING' : 'IDLE'}</span>
            </div>

            {/* Refresh Interactive Button */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onRefresh}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] text-[#F5F5F7] border border-white/[0.12] shadow-sm transition-all apple-press focus:outline-none"
              title="Refrescar telemetría y artefactos en tiempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-white' : 'text-[#D2D2D7]'}`} />
            </motion.button>
          </div>
        </div>

        {/* Mobile & Tablet Compact Navigation Bar */}
        <div className="flex xl:hidden overflow-x-auto py-2.5 space-x-2 border-t border-white/[0.06] no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all apple-press ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-md'
                    : 'text-[#86868B] hover:text-white bg-white/[0.04] border border-white/[0.06]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#86868B]'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}

export default Header

