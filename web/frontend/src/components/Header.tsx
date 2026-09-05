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
  Monitor,
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
    { id: 'bloomberg', label: 'Bloomberg Terminal', icon: Monitor },
    { id: 'pipeline', label: 'Pipeline Control', icon: Terminal },
    { id: 'execution', label: 'Mesa de Órdenes', icon: Layers },
    { id: 'trackrecord', label: 'Track Record', icon: TrendingUp },
    { id: 'architecture', label: 'Arquitectura & MCP', icon: Cpu },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#000000]/70 backdrop-blur-2xl transition-all">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Brand Mark */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative w-10 h-10 rounded-xl bg-[#141418] border border-white/[0.14] shadow-sm flex items-center justify-center text-white"
            >
              <Sparkles className="w-4 h-4 text-[#F5F5F7]" />
            </motion.div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  Quant<span className="text-[#A1A1A6]">Vibe</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-white/[0.08] text-[#D2D2D7] border border-white/[0.12]">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#86868B] font-medium hidden sm:block tracking-tight">
                Quantitative ML × Autonomous LLM Hands
              </p>
            </div>
          </div>

          {/* Center Navigation: Apple Pill */}
          <nav className="hidden lg:flex items-center p-1 rounded-full bg-[#121216]/90 border border-white/[0.08] shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-tight transition-colors ${
                    isActive ? 'text-white' : 'text-[#86868B] hover:text-[#F5F5F7]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/[0.18] shadow-sm"
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
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                gatePassed
                  ? 'bg-white/[0.04] text-[#F5F5F7] border-white/[0.12]'
                  : 'bg-red-500/10 text-red-300 border-red-500/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${gatePassed ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-[11px]">Gate: {gatePassed ? 'Validado' : 'Reprobado'}</span>
            </div>

            {/* Cryptographic SHA-256 Pill */}
            <div
              className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-white/[0.04] border-white/[0.12] text-[#F5F5F7]`}
              title={signals ? `Firma SHA-256: ${signals.checksum}` : 'No disponible'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#A1A1A6]" />
              <span className="text-[11px]">SHA-256 {isVerified ? 'Firmado' : 'Pendiente'}</span>
            </div>

            {/* Pipeline Status Indicator */}
            <div
              className={`hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono border ${
                isPipelineRunning
                  ? 'bg-white/[0.08] text-white border-white/20 animate-pulse'
                  : 'bg-white/[0.03] text-[#86868B] border-white/[0.08]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPipelineRunning ? 'bg-white animate-ping' : 'bg-[#636366]'
                }`}
              />
              <span className="text-[10px]">{isPipelineRunning ? 'RUNNING' : 'IDLE'}</span>
            </div>

            {/* Refresh Interactive Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F5F5F7] border border-white/[0.1] transition apple-press"
              title="Actualizar datos en tiempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-white' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 space-x-2 border-t border-white/[0.06] no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white/[0.14] text-white font-medium border border-white/20'
                    : 'text-[#86868B] hover:text-white bg-white/[0.03]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
