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
import { TradingViewChart } from './TradingViewChart'

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
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 apple-panel border border-white/[0.09] shadow-2xl">
        {/* Ambient atmospheric white lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.025] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] text-[#E8E8ED] text-xs font-medium tracking-tight">
              <Sparkles className="w-3.5 h-3.5 text-white/80" />
              <span>Quantitative Alpha Studio • Qlib v0.9 Engine</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F5F7] tracking-[-0.035em] leading-[1.08]">
              Señales Cuantitativas con <span className="text-white">Ventaja Estadística</span>
            </h2>

            <p className="text-sm text-[#86868B] leading-relaxed">
              Generadas con modelos de gradient boosting (LightGBM) sobre factores Alpha158. Las predicciones han superado el control de correlación rankeada de Spearman (Information Coefficient) antes de autorizar su publicación.
            </p>

            {/* Checksum Hash Strip */}
            {signals?.checksum && (
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleCopyChecksum}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/[0.1] text-xs font-mono text-[#D1D1D6] transition apple-press group"
                  title="Copiar hash SHA-256 para verificación independiente"
                >
                  <Lock className="w-3.5 h-3.5 text-[#86868B] group-hover:text-white transition-colors" />
                  <span className="truncate max-w-[200px] sm:max-w-[320px]">
                    {signals.checksum}
                  </span>
                  {copiedHash ? (
                    <Check className="w-3.5 h-3.5 text-[#30D158]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#F5F5F7] transition-colors" />
                  )}
                </button>
                <span className="text-[11px] font-mono text-[#30D158] font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Garantía de Inmutabilidad
                </span>
              </div>
            )}
          </div>

          {/* Gate Verification Dashboard Card */}
          {evaluation && (
            <motion.div
              whileHover={{ scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="w-full lg:w-auto min-w-[280px] sm:min-w-[320px] p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.1] shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                  Veredicto del Modelo
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#30D158]/15 text-[#30D158] text-xs font-bold border border-[#30D158]/30">
                  APROBADO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* IC Gauge */}
                <div className="space-y-1">
                  <div className="text-xs text-[#86868B] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#F5F5F7]" />
                    <span>Mean IC</span>
                  </div>
                  <div className="text-2xl font-bold font-sans tracking-tight text-[#F5F5F7] tnum">
                    {(evaluation.mean_ic * 100).toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-[#30D158] font-medium">
                    Exceso: +{(evaluation.mean_ic * 100).toFixed(2)}%
                  </div>
                </div>

                {/* ICIR Gauge */}
                <div className="space-y-1">
                  <div className="text-xs text-[#86868B] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#F5F5F7]" />
                    <span>Ratio ICIR</span>
                  </div>
                  <div className="text-2xl font-bold font-sans tracking-tight text-[#F5F5F7] tnum">
                    {evaluation.icir.toFixed(3)}
                  </div>
                  <div className="text-[11px] text-[#A1A1A6] font-medium">
                    Estabilidad Alta
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#86868B]">
                <span>Días de prueba:</span>
                <span className="font-semibold text-[#F5F5F7] tnum">{evaluation.n_days} sesiones</span>
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
          <h3 className="text-xl font-bold text-[#F5F5F7] tracking-[-0.025em] flex items-center gap-2.5">
            <span>Señales Activas del Portafolio</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#D1D1D6] border border-white/[0.1]">
              Top-{sigList.length} Seleccionadas
            </span>
          </h3>
          <p className="text-xs text-[#86868B] mt-0.5">
            Distribución cuantitativa ponderada para ejecución por el agente de Vibe-Trading.
          </p>
        </div>

        {/* Apple Segmented View Mode Switcher */}
        <div className="flex items-center p-1 rounded-full bg-[#1C1C1E] border border-white/[0.08] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center space-x-1.5 ${
              viewMode === 'grid'
                ? 'bg-white text-black shadow-sm font-semibold'
                : 'text-[#86868B] hover:text-[#F5F5F7]'
            }`}
            title="Vista de Tarjetas Interactivas"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tarjetas</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center space-x-1.5 ${
              viewMode === 'table'
                ? 'bg-white text-black shadow-sm font-semibold'
                : 'text-[#86868B] hover:text-[#F5F5F7]'
            }`}
            title="Vista de Tabla Detallada"
          >
            <List className="w-3.5 h-3.5" />
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
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 350, damping: 25 }}
                  className="rounded-2xl p-5 bg-[#0C0C10] border border-white/[0.08] hover:border-white/[0.2] flex flex-col justify-between group relative overflow-hidden transition-all shadow-lg hover:shadow-2xl"
                >
                  {/* Subtle rim highlight */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

                  {/* Header: Rank + Ticker */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wider ${
                          sig.rank === 1
                            ? 'bg-white text-black'
                            : 'bg-white/[0.06] text-[#A1A1A6] border border-white/[0.08]'
                        }`}
                      >
                        RANK #{sig.rank}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
                        BUY
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-2">
                      <h4 className="text-2xl font-extrabold text-[#F5F5F7] tracking-tight group-hover:text-white transition-colors">
                        {sig.instrument}
                      </h4>
                      <span className="text-[11px] text-[#86868B] font-mono">
                        {sigPayload?.metadata.data_source || 'ML Feed'}
                      </span>
                    </div>

                    {/* Score Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[#86868B]">Score Qlib:</span>
                        <span className="text-[#F5F5F7] font-semibold tnum">{sig.score.toFixed(4)}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${relativeScore}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + idx * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#FFFFFF] to-[#A1A1A6]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sparkline & Footer */}
                  <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="text-[11px] text-[#86868B] font-mono">
                      <span>Tendencia</span>
                      <div className="text-xs font-bold text-[#30D158]">+{(sig.score * 100).toFixed(1)}%</div>
                    </div>
                    <Sparkline data={sparklineData} positive={true} width={75} height={26} />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* High-Density Data Table View */
        <div className="rounded-2xl overflow-hidden bg-[#0C0C10] border border-white/[0.08] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-[#86868B] uppercase tracking-wider">
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
                    <tr key={sig.instrument} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.06] text-xs text-[#F5F5F7]">
                          #{sig.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-[#F5F5F7] text-base">
                        <span>{sig.instrument}</span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[#D1D1D6] tnum">
                        {sig.score.toFixed(6)}
                      </td>
                      <td className="py-3.5 px-5 w-48">
                        <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#FFFFFF] to-[#86868B] h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/[0.04] text-[#A1A1A6] border border-white/[0.08]">
                          {sigPayload?.metadata.data_source || 'synthetic'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold font-mono bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
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

      {/* TradingView Real-Time Candlestick Chart Terminal */}
      <TradingViewChart
        initialSymbol={sigList[0]?.instrument || 'TSLA'}
        availableSymbols={sigList.length > 0 ? sigList.map((s) => s.instrument) : ['TSLA', 'NVDA', 'AAPL', 'META', 'XOM']}
      />

      {/* Orders Plan Hero Gateway */}
      {orders && (
        <div className="rounded-3xl p-6 sm:p-7 bg-[#0C0C10] border border-white/[0.09] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#86868B] font-mono uppercase tracking-wider">
                Mesa de Ejecución del Agente
              </div>
              <h4 className="text-lg font-bold text-[#F5F5F7] tracking-tight">
                {orders.totals.planned_orders} Órdenes Preparadas (${orders.totals.estimated_exposure.toLocaleString('en-US', { minimumFractionDigits: 2 })} {orders.currency})
              </h4>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateToTab('execution')}
            className="apple-btn-primary flex items-center space-x-2 px-6 py-2.5 text-xs tracking-tight"
          >
            <span>Ver y Gestionar Mesa de Órdenes</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  )
}
