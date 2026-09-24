import React from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Star } from 'lucide-react'
import type { SystemStatus, EvaluationData } from '../types'
import { StatusDot } from './ui'

interface HeaderProps {
  status: SystemStatus | null
  evaluation: EvaluationData | null
  loading: boolean
  onRefresh: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TABS = [
  { id: 'landing', label: 'Showcase', full: 'Showcase Institucional' },
  { id: 'overview', label: 'Alpha Studio', full: 'Alpha Studio — Señales & Gate' },
  { id: 'bloomberg', label: 'Bloomberg', full: 'Terminal Bloomberg — Macro Desk' },
  { id: 'pipeline', label: 'Pipeline', full: 'Pipeline de Factores — Consola' },
  { id: 'execution', label: 'Mesa de Órdenes', full: 'Mesa de Órdenes — Agente Autónomo' },
  { id: 'trackrecord', label: 'Track Record', full: 'Track Record — Ledger Auditado' },
  { id: 'architecture', label: 'Arquitectura', full: 'Arquitectura & MCP' },
]

export const Header: React.FC<HeaderProps> = ({
  status,
  evaluation,
  loading,
  onRefresh,
  activeTab,
  setActiveTab,
}) => {
  const isPipelineRunning = status?.pipeline.is_running ?? false
  const gatePassed = evaluation?.passed ?? false

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-black/75 backdrop-blur-3xl">
      <div className="mx-auto max-w-[1780px] px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Brand — modern geometric sans wordmark */}
          <button
            onClick={() => setActiveTab('landing')}
            className="apple-press group flex shrink-0 items-baseline gap-2 select-none"
            title="Volver al Showcase Institucional"
          >
            <span className="font-sans text-xl font-extrabold tracking-tight text-white">
              Quant<span className="text-[#86868B] transition-colors group-hover:text-white">Vibe</span>
            </span>
            <span className="hidden rounded-full border border-white/[0.12] bg-white/[0.05] px-2 py-px font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#A1A1A6] sm:inline">
              Pro
            </span>
          </button>

          {/* Primary navigation — text tabs with spring active pill */}
          <nav
            className="no-scrollbar hidden items-center gap-1 overflow-x-auto rounded-full border border-white/[0.07] bg-white/[0.02] p-1 backdrop-blur-2xl xl:flex"
            aria-label="Navegación principal"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.full}
                  className={`apple-press relative rounded-full px-4 py-1.5 text-xs font-medium tracking-tight transition-colors ${
                    isActive ? 'text-black' : 'text-[#86868B] hover:text-[#F5F5F7]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="headerActiveTab"
                      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-white shadow-[0_2px_14px_rgba(255,255,255,0.2)]"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Status cluster: gate + pipeline + refresh (SHA lives in Alpha Studio) */}
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors sm:flex ${
                gatePassed
                  ? 'border-[#30D158]/25 bg-[#30D158]/[0.08] text-[#30D158]'
                  : 'border-[#FF453A]/25 bg-[#FF453A]/[0.08] text-[#FF453A]'
              }`}
              title={
                evaluation
                  ? `Mean IC: ${evaluation.mean_ic.toFixed(4)} · ICIR: ${evaluation.icir.toFixed(3)} · N=${evaluation.n_days} días`
                  : 'Gate de publicación IC/ICIR'
              }
            >
              <StatusDot tone={gatePassed ? 'pos' : 'neg'} ping={gatePassed} />
              <span>Gate {gatePassed ? 'Pass' : 'Fail'}</span>
            </div>

            <div
              className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] lg:flex ${
                isPipelineRunning
                  ? 'border-white/25 bg-white/[0.08] text-white'
                  : 'border-white/[0.08] bg-white/[0.02] text-[#86868B]'
              }`}
              title="Estado del pipeline de factores"
            >
              <StatusDot tone={isPipelineRunning ? 'pos' : 'muted'} ping={isPipelineRunning} />
              <span>{isPipelineRunning ? 'Running' : 'Idle'}</span>
            </div>

            {/* GitHub Repository Star & Link */}
            <a
              href="https://github.com/Ax3lsk3r3/QuantVibe"
              target="_blank"
              rel="noopener noreferrer"
              title="Danos una estrella en GitHub · Repositorio oficial"
              aria-label="Star QuantVibe on GitHub"
              className="apple-press flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#D2D2D7] transition-all hover:border-yellow-400/40 hover:bg-white/[0.08] hover:text-white"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span className="hidden sm:inline">Star</span>
              <Star className="h-3 w-3 fill-yellow-400/80 text-yellow-400" />
            </a>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refrescar telemetría"
              title="Refrescar telemetría y artefactos"
              className="apple-press rounded-full border border-white/[0.1] bg-white/[0.04] p-2 text-[#D2D2D7] transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-white' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Mobile & tablet navigation row */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-white/[0.05] py-2.5 xl:hidden">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`apple-press shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-white font-semibold text-black'
                    : 'border border-white/[0.07] bg-white/[0.02] text-[#86868B] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}

export default Header
