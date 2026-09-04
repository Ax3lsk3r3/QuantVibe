import React from 'react'
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Database,
  Lock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import type { EvaluationData, OrdersPlan, SignalsResponse } from '../types'

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
  const sigPayload = signals?.payload
  const sigList = sigPayload?.signals || []
  const maxScore = sigList.length > 0 ? Math.max(...sigList.map((s) => s.score)) : 1

  return (
    <div className="space-y-6">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Mean IC */}
        <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4 card-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Information Coeff (IC)
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">
              {evaluation ? (evaluation.mean_ic * 100).toFixed(2) + '%' : '—'}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Umbral: ≥0.0%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Correlación Spearman de predicciones vs retornos futuros
          </p>
        </div>

        {/* Metric 2: ICIR */}
        <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4 card-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Ratio ICIR (Estabilidad)
            </span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">
              {evaluation ? evaluation.icir.toFixed(3) : '—'}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Estable (&gt;0.15)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Media del IC dividida por su desviación estándar temporal
          </p>
        </div>

        {/* Metric 3: Hit Rate Top-K */}
        <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4 card-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Hit-Rate Top-{sigPayload?.metadata.top_k || 5}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">
              {evaluation ? (evaluation.hit_rate_topk * 100).toFixed(1) + '%' : '—'}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Exceso positivo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Porcentaje de señales del top-k que generan retorno positivo
          </p>
        </div>

        {/* Metric 4: Active Model & Horizon */}
        <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-4 card-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Modelo & Horizonte
            </span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold font-mono text-cyan-300">
              {sigPayload?.source_model || '—'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({sigPayload?.horizon_days || 1}d)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fecha de cálculo:{' '}
            <span className="text-slate-300 font-mono">{sigPayload?.as_of || 'N/A'}</span>
          </p>
        </div>
      </div>

      {/* Publication Gate Banner */}
      {evaluation && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            evaluation.passed
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
          }`}
        >
          <div className="flex items-start space-x-3">
            {evaluation.passed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-semibold text-sm font-mono flex items-center gap-2">
                Gate de Publicación Cuantitativa:{' '}
                {evaluation.passed ? 'SUPERADO CON ÉXITO' : 'REPROBADO'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluado sobre {evaluation.n_days} días de prueba.{' '}
                {evaluation.passed
                  ? 'Las métricas de IC e ICIR garantizan validez estadística antes de arriesgar capital.'
                  : `Fallos: ${evaluation.failures.join(', ')}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 self-end sm:self-center">
            <span className="text-xs font-mono text-slate-400">
              Retorno medio Top-k: {(evaluation.avg_topk_fwd_return * 100).toFixed(3)}%/día
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Signals Table + Execution Plan Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Top-k Signals Table */}
        <div className="lg:col-span-2 bg-dark-800/70 border border-dark-600 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-dark-600 flex items-center justify-between bg-dark-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono font-semibold text-sm text-white">
                Señales Cuantitativas Top-{sigList.length} (Activas)
              </h3>
            </div>
            {signals?.checksum && (
              <div
                className="flex items-center space-x-1.5 text-xs font-mono text-cyan-300/80 bg-dark-900 px-2.5 py-1 rounded border border-dark-700 cursor-help"
                title={`Firma SHA-256 canónica: ${signals.checksum}`}
              >
                <Lock className="w-3 h-3 text-cyan-400" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {signals.checksum}
                </span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700 bg-dark-900/50 text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Instrumento</th>
                  <th className="py-3 px-4">Score ML</th>
                  <th className="py-3 px-4">Intensidad Relativa</th>
                  <th className="py-3 px-4">Procedencia</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700 text-sm font-mono">
                {sigList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                      No hay señales activas. Ejecuta el pipeline para generarlas.
                    </td>
                  </tr>
                ) : (
                  sigList.map((sig) => {
                    const pct = Math.max(5, (sig.score / maxScore) * 100)
                    return (
                      <tr
                        key={sig.instrument}
                        className="hover:bg-dark-700/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-bold">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                              sig.rank === 1
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : sig.rank === 2
                                ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                                : sig.rank === 3
                                ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                                : 'bg-dark-700 text-slate-400'
                            }`}
                          >
                            #{sig.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                          <span className="text-cyan-300">{sig.instrument}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {sig.score.toFixed(6)}
                        </td>
                        <td className="py-3 px-4 w-40">
                          <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-dark-700">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-xs bg-dark-900 text-slate-300 border border-dark-600">
                            {sigPayload?.metadata.data_source || 'synthetic'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                            BUY
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Orders Plan & Vibe Trading Overview */}
        <div className="bg-dark-800/70 border border-dark-600 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-dark-600 pb-3">
              <h3 className="font-mono font-semibold text-sm text-white">
                Plan de Órdenes (Vibe-Trading)
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  orders?.dry_run
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {orders?.dry_run ? 'MODO PAPEL (DRY RUN)' : 'LIVE SUBMIT'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-dark-900/80 p-3 rounded-lg border border-dark-700 font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Exposición Objetivo:</span>
                  <span className="text-white font-bold">
                    ${orders?.total_notional_target.toLocaleString('en-US') || '10,000.00'}{' '}
                    {orders?.currency || 'USD'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Exposición Estimada:</span>
                  <span className="text-cyan-300 font-bold">
                    ${orders?.totals.estimated_exposure.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    }) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Órdenes Planificadas:</span>
                  <span className="text-emerald-400 font-bold">
                    {orders?.totals.planned_orders || 0} órdenes equal-weight
                  </span>
                </div>
              </div>

              {/* Mini preview list */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {orders?.orders.map((ord) => (
                  <div
                    key={ord.instrument}
                    className="flex items-center justify-between p-2 rounded bg-dark-900/50 border border-dark-700/60 text-xs font-mono"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-400 font-bold">{ord.action}</span>
                      <span className="text-white font-semibold">{ord.instrument}</span>
                      <span className="text-slate-400">×{ord.qty}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-300">
                        ${ord.est_notional.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-dark-600">
            <button
              onClick={() => onNavigateToTab('execution')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-medium text-xs sm:text-sm transition shadow-lg shadow-cyan-900/30"
            >
              <span>Abrir Mesa de Órdenes</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
