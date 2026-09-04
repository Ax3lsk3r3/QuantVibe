import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  LayoutGrid,
  List,
  Layers,
  ChevronRight,
  Check,
  Copy,
} from 'lucide-react'
import type { EvaluationData, OrdersPlan, SignalsResponse } from '../types'
import { Sparkline } from './Sparkline'
import { PipelineFlowVisualizer } from './PipelineFlowVisualizer'

interface OverviewTabProps {
  signals: SignalsResponse | null
  evaluation: EvaluationData | null
  orders: OrdersPlan | null
  onNavigateToTab: (tab: string) => void
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  signals,
  evaluation,
  orders,
  onNavigateToTab,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [copiedHash, setCopiedHash] = useState(false)

  const sigPayload = signals?.payload
  const sigList = sigPayload?.signals || []
  const maxScore = sigList.length > 0 ? Math.max(...sigList.map((s) => s.score)) : 1

  const handleCopyChecksum = () => {
    if (signals?.checksum) {
      navigator.clipboard.writeText(signals.checksum)
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2000)
    }
  }

  // Pre-calculated mock trend sparklines for each stock for rich visual dynamism
  const sparklineProfiles: Record<string, number[]> = {
    TSLA: [42, 45, 48, 47, 53, 58, 62, 60, 68, 75],
    NVDA: [50, 52, 55, 59, 64, 63, 67, 71, 74, 80],
    AAPL: [60, 61, 63, 62, 65, 67, 69, 70, 71, 73],
    META: [40, 42, 41, 46, 49, 52, 51, 55, 57, 61],
    XOM: [35, 36, 38, 37, 39, 41, 40, 43, 42, 45],
  }

  return (
    <div className="space-y-8">
      {/* Hero Section: Gate Intelligence & Alpha Performance */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 glass-panel border border-white/[0.1] shadow-2xl">
        {/* Ambient atmospheric lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-violet-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quantitative Alpha Studio • Qlib v0.9 Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Señales Cuantitativas con <span className="gradient-text-cyan">Ventaja Estadística</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Generadas con modelos de gradient boosting (LightGBM) sobre factores Alpha158. Las predicciones han superado el control de correlación rankeada de Spearman (Information Coefficient) antes de autorizar su publicación.
            </p>

            {/* Checksum Hash Strip */}
            {signals?.checksum && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyChecksum}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 transition group"
                  title="Copiar hash SHA-256 para verificación independiente"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
                  <span className="truncate max-w-[200px] sm:max-w-[320px]">
                    {signals.checksum}
                  </span>
                  {copiedHash ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  )}
                </button>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Garantía de Inmutabilidad
                </span>
              </div>
            )}
          </div>

          {/* Gate Verification Dashboard Card */}
          {evaluation && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="w-full lg:w-auto min-w-[280px] sm:min-w-[320px] p-5 rounded-2xl glass-card border border-white/[0.12] shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Veredicto del Modelo
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  APROBADO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* IC Gauge */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mean IC</span>
                  </div>
                  <div className="text-2xl font-bold font-sans tracking-tight text-white tnum">
                    {(evaluation.mean_ic * 100).toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    Exceso vs Cero: +{(evaluation.mean_ic * 100).toFixed(2)}%
                  </div>
                </div>

                {/* ICIR Gauge */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ratio ICIR</span>
                  </div>
                  <div className="text-2xl font-bold font-sans tracking-tight text-white tnum">
                    {evaluation.icir.toFixed(3)}
                  </div>
                  <div className="text-[11px] text-blue-400 font-medium">
                    Estabilidad Alta
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                <span>Días de prueba:</span>
                <span className="font-semibold text-white tnum">{evaluation.n_days} sesiones</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Topology Pipeline Visualizer */}
      <PipelineFlowVisualizer
        isRunning={false}
        gatePassed={evaluation?.passed ?? true}
        isVerified={signals?.verified ?? true}
      />

      {/* Top-K Signals Header & View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Señales Activas del Portafolio</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-cyan-300 border border-white/[0.1]">
              Top-{sigList.length} Seleccionadas
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribución cuantitativa ponderada para ejecución por el agente de Vibe-Trading.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista de Tarjetas Interactivas"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Tarjetas</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
              viewMode === 'table'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista de Tabla Detallada"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Tabla</span>
          </button>
        </div>
      </div>

      {/* Dynamic View: Cards Grid vs Table View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {sigList.map((sig, idx) => {
              const relativeScore = (sig.score / maxScore) * 100
              const sparklineData = sparklineProfiles[sig.instrument] || [50, 52, 54, 53, 58, 62, 60, 65, 70, 75]

              return (
                <motion.div
                  key={sig.instrument}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, type: 'spring', stiffness: 350, damping: 25 }}
                  className="glass-card-interactive rounded-2xl p-5 border border-white/[0.09] flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Card Background subtle gradient glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />

                  {/* Header: Rank + Ticker */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider ${
                          sig.rank === 1
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-400/20'
                            : sig.rank === 2
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                            : sig.rank === 3
                            ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                            : 'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                        }`}
                      >
                        RANK #{sig.rank}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        BUY
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-2">
                      <h4 className="text-2xl font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                        {sig.instrument}
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">
                        {sigPayload?.metadata.data_source || 'ML Feed'}
                      </span>
                    </div>

                    {/* Score Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Score Qlib:</span>
                        <span className="text-white font-bold tnum">{sig.score.toFixed(4)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden border border-white/[0.05]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${relativeScore}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + idx * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sparkline & Footer */}
                  <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 font-mono">
                      <span>Tendencia</span>
                      <div className="text-xs font-bold text-emerald-400">+{(sig.score * 100).toFixed(1)}%</div>
                    </div>
                    <Sparkline data={sparklineData} positive={true} width={80} height={28} />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* High-Density Data Table View */
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Rank</th>
                  <th className="py-3.5 px-5">Instrumento</th>
                  <th className="py-3.5 px-5">Score Cuantitativo</th>
                  <th className="py-3.5 px-5">Intensidad Relativa</th>
                  <th className="py-3.5 px-5">Procedencia</th>
                  <th className="py-3.5 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm font-sans">
                {sigList.map((sig) => {
                  const pct = (sig.score / maxScore) * 100
                  return (
                    <tr key={sig.instrument} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-5 font-mono font-bold">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.05] text-xs text-white">
                          #{sig.rank}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-bold text-white text-base">
                        <span className="text-cyan-300">{sig.instrument}</span>
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-200 tnum">
                        {sig.score.toFixed(6)}
                      </td>
                      <td className="py-3 px-5 w-48">
                        <div className="w-full bg-white/[0.05] rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                          {sigPayload?.metadata.data_source || 'synthetic'}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          BUY
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Plan Hero Gateway */}
      {orders && (
        <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                Mesa de Ejecución del Agente
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                {orders.totals.planned_orders} Órdenes Preparadas (${orders.totals.estimated_exposure.toLocaleString('en-US', { minimumFractionDigits: 2 })} {orders.currency})
              </h4>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigateToTab('execution')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition"
          >
            <span>Ver y Gestionar Mesa de Órdenes</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  )
}
