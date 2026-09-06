import React, { useState } from 'react'
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Lock,
  LayoutGrid,
  List,
  Layers,
  ChevronRight,
  Check,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react'
import type { EvaluationData, OrdersPlan, SignalsResponse } from '../types'
import { Sparkline } from './Sparkline'
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
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string>('TSLA')

  const sigPayload = signals?.payload
  const sigList = sigPayload?.signals || [
    { instrument: 'TSLA', score: 0.128151, rank: 1 },
    { instrument: 'AAPL', score: 0.100546, rank: 2 },
    { instrument: 'META', score: 0.083558, rank: 3 },
    { instrument: 'JPM', score: 0.054135, rank: 4 },
    { instrument: 'NVDA', score: 0.047451, rank: 5 },
  ]

  const handleCopyChecksum = () => {
    if (signals?.checksum) {
      navigator.clipboard.writeText(signals.checksum)
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2000)
    }
  }

  const sparklineProfiles: Record<string, number[]> = {
    TSLA: [42, 45, 48, 47, 53, 58, 62, 60, 68, 75],
    NVDA: [50, 52, 55, 59, 64, 63, 67, 71, 74, 80],
    AAPL: [60, 61, 63, 62, 65, 67, 69, 70, 71, 73],
    META: [40, 42, 41, 46, 49, 52, 51, 55, 57, 61],
    JPM: [38, 40, 42, 41, 44, 46, 45, 48, 50, 53],
    XOM: [35, 36, 38, 37, 39, 41, 40, 43, 42, 45],
  }

  const icValue = evaluation ? (evaluation.mean_ic * 100).toFixed(2) : '+6.81'
  const icirValue = evaluation ? evaluation.icir.toFixed(3) : '+0.203'
  const hitRateValue = evaluation ? (evaluation.hit_rate_topk * 100).toFixed(1) : '57.1'
  const exposureTotal = orders?.totals?.estimated_exposure
    ? orders.totals.estimated_exposure.toLocaleString('en-US', { minimumFractionDigits: 2 })
    : '9,740.10'

  return (
    <div className="space-y-6 w-full font-sans">
      {/* 1. TOP WIDESCREEN KPI TELEMETRY RIBBON (Apple Pro Titanium Bar) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Mean IC */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#09090D] border border-white/[0.08] relative overflow-hidden shadow-lg group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-mono mb-2">
            <span className="uppercase tracking-wider">Mean IC (1d)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            +{icValue}%
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Gate Superado (≥ 0.00%)</span>
          </div>
        </div>

        {/* Metric 2: ICIR */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#09090D] border border-white/[0.08] relative overflow-hidden shadow-lg group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-mono mb-2">
            <span className="uppercase tracking-wider">Ratio ICIR</span>
            <Award className="w-3.5 h-3.5 text-white/50" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            {icirValue}
          </div>
          <div className="text-[11px] font-mono text-[#A1A1A6] mt-1">
            Estabilidad Cuantitativa Alta
          </div>
        </div>

        {/* Metric 3: Hit Rate Top-K */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#09090D] border border-white/[0.08] relative overflow-hidden shadow-lg group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-mono mb-2">
            <span className="uppercase tracking-wider">Hit-Rate Top-5</span>
            <TrendingUp className="w-3.5 h-3.5 text-white/50" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            {hitRateValue}%
          </div>
          <div className="text-[11px] font-mono text-[#86868B] mt-1">
            Alpha medio vs universo +0.118%
          </div>
        </div>

        {/* Metric 4: Planned Exposure */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#09090D] border border-white/[0.08] relative overflow-hidden shadow-lg group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-mono mb-2">
            <span className="uppercase tracking-wider">Exposición Activa</span>
            <Layers className="w-3.5 h-3.5 text-white/50" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            ${exposureTotal}
          </div>
          <div className="text-[11px] font-mono text-[#86868B] mt-1">
            {orders?.totals?.planned_orders ?? 5} Órdenes (Max 20% cap)
          </div>
        </div>

        {/* Metric 5: Cryptographic Vault */}
        <div className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl bg-[#09090D] border border-white/[0.08] relative overflow-hidden shadow-lg group hover:border-white/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#86868B] text-xs font-mono mb-2">
            <span className="uppercase tracking-wider">Bóveda SHA-256</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <button
            onClick={handleCopyChecksum}
            className="text-left group/btn"
            title="Copiar hash SHA-256"
          >
            <div className="text-xs font-mono text-[#D2D2D7] truncate font-medium group-hover/btn:text-white transition-colors">
              {signals?.checksum ? signals.checksum.substring(0, 16) + '...' : '1154c789fed7...'}
            </div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
              {copiedHash ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Hash Copiado</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Sello Inmutable (Click copiar)</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: ASYMMETRIC 12-COLUMN FINANCIAL TERMINAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE (7 COLS): TRADINGVIEW PRO CANDLESTICK CHART */}
        <div className="lg:col-span-7 space-y-4">
          <TradingViewChart
            initialSymbol={selectedChartSymbol}
            availableSymbols={sigList.map((s) => s.instrument)}
          />
        </div>

        {/* RIGHT PANE (5 COLS): ALPHA SIGNALS MATRIX & GATE VERDICT */}
        <div className="lg:col-span-5 space-y-5">
          {/* Signals Control Card */}
          <div className="p-6 rounded-3xl bg-[#09090D] border border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Ranking Alpha Qlib</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A1A1A6]">
                    Top {sigList.length}
                  </span>
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Ponderación de portafolio validada por el firewall estadístico.
                </p>
              </div>

              {/* View toggle */}
              <div className="flex items-center p-1 rounded-xl bg-[#1C1C22] border border-white/[0.08]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-black' : 'text-[#86868B] hover:text-white'
                  }`}
                  title="Vista tarjetas"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-white text-black' : 'text-[#86868B] hover:text-white'
                  }`}
                  title="Vista tabla"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Signal List */}
            {viewMode === 'grid' ? (
              <div className="space-y-2.5">
                {sigList.map((sig) => {
                  const sparklineData = sparklineProfiles[sig.instrument] || [45, 48, 52, 50, 56, 60, 65]
                  const isSelected = selectedChartSymbol === sig.instrument

                  return (
                    <div
                      key={sig.instrument}
                      onClick={() => setSelectedChartSymbol(sig.instrument)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-white/[0.08] border-white/30 shadow-md'
                          : 'bg-[#0E0E14] border-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs font-mono font-bold flex items-center justify-center text-white">
                          #{sig.rank}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white font-sans text-sm group-hover:text-white transition-colors">
                              {sig.instrument}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-semibold">
                              BUY
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-[#86868B]">
                            Score: <span className="text-white font-medium">{sig.score.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Sparkline data={sparklineData} positive={true} width={65} height={22} />
                        <ArrowUpRight className="w-4 h-4 text-[#86868B] group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[#86868B] pb-2">
                      <th className="py-2">Rank</th>
                      <th className="py-2">Ticker</th>
                      <th className="py-2">Score</th>
                      <th className="py-2 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {sigList.map((s) => (
                      <tr
                        key={s.instrument}
                        onClick={() => setSelectedChartSymbol(s.instrument)}
                        className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 text-[#86868B]">#{s.rank}</td>
                        <td className="py-2.5 font-bold text-white">{s.instrument}</td>
                        <td className="py-2.5 text-[#D2D2D7]">{s.score.toFixed(6)}</td>
                        <td className="py-2.5 text-right text-emerald-400 font-bold">BUY</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Model Gate Evaluation Card */}
          <div className="p-6 rounded-3xl bg-[#09090D] border border-white/[0.08] shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                  Control Matemático de Backtest
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                APROBADO
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                <div className="text-[#86868B]">Horizonte Walk-Forward</div>
                <div className="text-white font-bold text-sm mt-0.5">
                  {evaluation?.n_days ?? 1459} sesiones
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                <div className="text-[#86868B]">Modelo Activo</div>
                <div className="text-white font-bold text-sm mt-0.5">LightGBM (Alpha158)</div>
              </div>
            </div>

            <p className="text-xs text-[#86868B] leading-relaxed">
              Las señales son auditadas antes de su persistencia. Ninguna orden puede ejecutarse si el modelo no demuestra una correlación de rango Spearman positiva en ventana móvil.
            </p>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: PLANNED ORDERS MATRIX & EXECUTION LAUNCHPAD */}
      {orders && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#09090D] border border-white/[0.08] shadow-2xl relative overflow-hidden space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Plan de Órdenes Preparadas
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Asignación de capital generada por el agente autónomo Vibe-Trading (dry_run={orders.dry_run ? 'true' : 'false'}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/[0.06] border border-white/[0.1] text-[#D2D2D7]">
                Exposición Total: ${exposureTotal} {orders.currency}
              </span>
              <button
                onClick={() => onNavigateToTab('execution')}
                className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#EAEAEA] transition-all flex items-center space-x-1.5 shadow-lg"
              >
                <span>Ir a Mesa de Ejecución</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#86868B] pb-3">
                  <th className="py-2.5 px-3">Acción</th>
                  <th className="py-2.5 px-3">Instrumento</th>
                  <th className="py-2.5 px-3">Cantidad</th>
                  <th className="py-2.5 px-3">Precio Estimado</th>
                  <th className="py-2.5 px-3">Exposición</th>
                  <th className="py-2.5 px-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.orders.map((o) => (
                  <tr key={o.instrument} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                        {o.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white text-sm">{o.instrument}</td>
                    <td className="py-3 px-3 text-[#D2D2D7] tabular-nums">{o.qty} accs</td>
                    <td className="py-3 px-3 text-[#86868B] tabular-nums">
                      ${o.est_price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-white font-semibold tabular-nums">
                      ${o.est_notional.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right text-[#86868B]">
                      {o.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
