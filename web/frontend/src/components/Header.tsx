import React from 'react'
import { Activity, CheckCircle2, ShieldCheck, Cpu, RefreshCw, Terminal, Layers } from 'lucide-react'
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
    { id: 'overview', label: 'Terminal & Señales', icon: Activity },
    { id: 'pipeline', label: 'Ejecutar Pipeline', icon: Terminal },
    { id: 'execution', label: 'Mesa de Órdenes', icon: Layers },
    { id: 'trackrecord', label: 'Track Record & Alpha', icon: CheckCircle2 },
    { id: 'architecture', label: 'Arquitectura & MCP', icon: Cpu },
  ]

  return (
    <header className="border-b border-dark-700 bg-dark-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-mono font-black text-white shadow-lg shadow-cyan-500/20">
              QV
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  Quant<span className="text-cyan-400">Vibe</span>
                </span>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  Terminal v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Microsoft Qlib ML Brain × Vibe-Trading Agent Hands
              </p>
            </div>
          </div>

          {/* Real-time Status Badges */}
          <div className="flex items-center space-x-3">
            {/* Gate Status Badge */}
            <div
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                gatePassed
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                  : 'bg-rose-950/40 text-rose-400 border-rose-800/50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${gatePassed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span>Gate: {gatePassed ? 'APROBADO' : 'FALLO'}</span>
            </div>

            {/* SHA-256 Integrity Badge */}
            <div
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                isVerified
                  ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/50'
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/50'
              }`}
              title={signals ? `Hash: ${signals.checksum}` : 'Sin señales cargadas'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHA-256: {isVerified ? 'VERIFICADO' : 'NO DISPONIBLE'}</span>
            </div>

            {/* Pipeline Runner Status */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
                isPipelineRunning
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 animate-pulse'
                  : 'bg-dark-800 text-slate-400 border-dark-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPipelineRunning ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'
                }`}
              />
              <span>{isPipelineRunning ? 'PIPELINE CORRIENDO' : 'EN ESPERA'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-dark-800 text-slate-300 hover:text-white hover:bg-dark-700 border border-dark-600 transition"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
