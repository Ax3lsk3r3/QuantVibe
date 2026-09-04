import React from 'react'
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
  CheckCircle2,
  XCircle,
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
  const isPipelineRunning = status?.pipeline.is_running ?? false
  const isVerified = signals?.verified ?? false
  const gatePassed = evaluation?.passed ?? false

  const tabs = [
    { id: 'landing', label: 'SaaS Showcase', icon: Sparkles },
    { id: 'overview', label: 'Alpha Studio', icon: Activity },
    { id: 'pipeline', label: 'Pipeline Control', icon: Terminal },
    { id: 'execution', label: 'Mesa de Órdenes', icon: Layers },
    { id: 'trackrecord', label: 'Track Record', icon: TrendingUp },
    { id: 'architecture', label: 'Arquitectura & MCP', icon: Cpu },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07090E]/70 backdrop-blur-2xl shadow-xl transition-all">
      {/* Top subtle decorative ambient gradient beam */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/40 via-violet-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Brand Mark */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3.5 cursor-pointer group"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20"
            >
              <div className="w-full h-full rounded-2xl bg-[#090D16] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse-subtle" />
              </div>
            </motion.div>

            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                  Quant<span className="gradient-text-cyan">Vibe</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-cyan-300 border border-cyan-500/30">
                  Pro Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Microsoft Qlib Intelligence × Vibe-Trading Autonomous Agent
              </p>
            </div>
          </div>

          {/* Center Navigation with Framer Motion Glass Pill */}
          <nav className="hidden lg:flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                    />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right Status Indicators & Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Model Gate Quality Pill */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm ${
                gatePassed
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}
            >
              {gatePassed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>Gate: {gatePassed ? 'Validado' : 'Reprobado'}</span>
            </motion.div>

            {/* Cryptographic SHA-256 Pill */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm ${
                isVerified
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
              title={signals ? `Firma SHA-256: ${signals.checksum}` : 'No disponible'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHA-256 {isVerified ? 'Firmado' : 'Pendiente'}</span>
            </motion.div>

            {/* Pipeline Status Indicator */}
            <div
              className={`hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono border ${
                isPipelineRunning
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 animate-pulse'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.08]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPipelineRunning ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'
                }`}
              />
              <span>{isPipelineRunning ? 'RUNNING' : 'IDLE'}</span>
            </div>

            {/* Refresh Interactive Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onRefresh}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.1] transition shadow-md"
              title="Actualizar datos en tiempo real"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 space-x-2 border-t border-white/[0.05]">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white bg-white/[0.02]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
