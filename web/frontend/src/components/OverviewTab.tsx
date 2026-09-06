import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, List, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { EvaluationData, OrdersPlan, SignalsResponse } from '../types'
import { Sparkline } from './Sparkline'
import { TradingViewChart } from './TradingViewChart'
import {
  Btn,
  CopyChip,
  DataRow,
  Eyebrow,
  MetricRail,
  Reveal,
  StatusDot,
  cn,
  type MetricItem,
} from './ui'

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
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string>('')

  const payload = signals?.payload
  const sigList = payload?.signals ?? []
  const activeSymbol = selectedChartSymbol || sigList[0]?.instrument || 'TSLA'

  /* Single source of truth: action per instrument comes from the real orders plan */
  const orderActionByInstrument = new Map(
    (orders?.orders ?? []).map((o) => [o.instrument, o.action])
  )

  const sparklineProfiles: Record<string, number[]> = {
    TSLA: [42, 45, 48, 47, 53, 58, 62, 60, 68, 75],
    NVDA: [50, 52, 55, 59, 64, 63, 67, 71, 74, 80],
    AAPL: [60, 61, 63, 62, 65, 67, 69, 70, 71, 73],
    META: [40, 42, 41, 46, 49, 52, 51, 55, 57, 61],
    JPM: [38, 40, 42, 41, 44, 46, 45, 48, 50, 53],
    XOM: [35, 36, 38, 37, 39, 41, 40, 43, 42, 45],
  }

  const exposureTotal = orders?.totals?.estimated_exposure
  const maxScore = Math.max(...sigList.map((s) => Math.abs(s.score)), 0.0001)

  const railItems: MetricItem[] = [
    {
      label: 'Mean IC (Spearman)',
      value: evaluation ? `+${evaluation.mean_ic.toFixed(4)}` : '—',
      sub: evaluation
        ? `umbral ≥ ${evaluation.thresholds?.min_mean_ic ?? 0}`
        : 'esperando evaluación',
      tone: evaluation ? (evaluation.passed ? 'pos' : 'neg') : 'muted',
    },
    {
      label: 'Ratio ICIR',
      value: evaluation ? `+${evaluation.icir.toFixed(3)}` : '—',
      sub: 'estabilidad de señal',
    },
    {
      label: 'Hit-Rate Top-K',
      value: evaluation ? `${(evaluation.hit_rate_topk * 100).toFixed(1)}%` : '—',
      sub: evaluation ? `${evaluation.n_days.toLocaleString('en-US')} sesiones` : undefined,
    },
    {
      label: 'Exposición planificada',
      value: exposureTotal
        ? `$${exposureTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        : '—',
      sub: orders ? `${orders.totals.planned_orders} órdenes · cap 20%` : 'sin plan activo',
    },
    {
      label: `Bóveda SHA-256 · ${signals?.verified ? 'verificado' : 'pendiente'}`,
      value: (
        <div className="flex items-center gap-2">
          <StatusDot tone={signals?.verified ? 'pos' : 'warn'} />
          <span className="truncate text-sm">
            {signals?.checksum ? `${signals.checksum.slice(0, 10)}…` : '—'}
          </span>
          {signals?.checksum && <CopyChip text={signals.checksum} label="Copiar" />}
        </div>
      ),
      sub: 'sello canónico del lote',
    },
  ]

  return (
    <div className="w-full space-y-10 font-sans">
      {/* 1. Editorial command head */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Eyebrow>
            <span className="flex items-center gap-2">
              <StatusDot tone={signals?.verified ? 'pos' : 'warn'} ping={signals?.verified} />
              Alpha Studio · lote {payload?.as_of ?? '—'}
            </span>
          </Eyebrow>
          <h1 className="mt-3 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
            Cartera validada por el <em className="italic text-[#6E6E73]">firewall estadístico.</em>
          </h1>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#636366]">
          <span>modelo: {payload?.source_model ?? '—'}</span>
          <span className="h-3 w-px bg-white/[0.1]" />
          <span>horizonte: {payload?.horizon_days ?? '—'}d</span>
        </div>
      </div>

      {/* 2. Full-bleed metric rail (replaces floating KPI boxes) */}
      <MetricRail items={railItems} cols={5} />

      {/* 3. Asymmetric workspace: chart stage + signal column */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <TradingViewChart
            initialSymbol={activeSymbol}
            availableSymbols={sigList.length > 0 ? sigList.map((s) => s.instrument) : ['TSLA']}
          />
        </div>

        <div className="space-y-6 lg:col-span-4">
          {/* Alpha ranking — dense terminal rows */}
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#050507]/70 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-white">
                    Ranking Alpha Qlib
                  </h3>
                  <p className="font-mono text-[10px] text-[#636366]">
                    top {sigList.length} · click para graficar
                  </p>
                </div>
                <div className="flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Vista tarjetas"
                    className={cn(
                      'rounded-full p-1.5 transition-colors',
                      viewMode === 'grid' ? 'bg-white text-black' : 'text-[#86868B] hover:text-white'
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    aria-label="Vista tabla"
                    className={cn(
                      'rounded-full p-1.5 transition-colors',
                      viewMode === 'table' ? 'bg-white text-black' : 'text-[#86868B] hover:text-white'
                    )}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {sigList.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16">
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-white"
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#636366]">
                    Cargando señales firmadas…
                  </span>
                </div>
              ) : viewMode === 'grid' ? (
                <div>
                  {sigList.map((sig) => {
                    const action = orderActionByInstrument.get(sig.instrument)
                    return (
                      <DataRow
                        key={sig.instrument}
                        onClick={() => setSelectedChartSymbol(sig.instrument)}
                        active={activeSymbol === sig.instrument}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="w-5 shrink-0 font-mono text-[10px] text-[#636366]">
                            #{sig.rank}
                          </span>
                          <span className="text-sm font-bold tracking-tight text-white">
                            {sig.instrument}
                          </span>
                          <span
                            className={cn(
                              'shrink-0 rounded px-1.5 py-px font-mono text-[9px] font-bold',
                              action ? 'badge-terminal-green' : 'badge-terminal-neutral'
                            )}
                          >
                            {action ?? 'TOP-K'}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <div className="hidden h-1 w-16 overflow-hidden rounded-full bg-white/[0.06] sm:block">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(Math.abs(sig.score) / maxScore) * 100}%` }}
                              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full rounded-full bg-gradient-to-r from-[#86868B] to-white"
                            />
                          </div>
                          <Sparkline
                            data={sparklineProfiles[sig.instrument] ?? [45, 48, 52, 50, 56, 60, 65]}
                            width={56}
                            height={20}
                          />
                          <span className="tnum w-16 text-right font-mono text-xs font-semibold text-white">
                            {sig.score >= 0 ? '+' : ''}
                            {sig.score.toFixed(4)}
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-[#48484A] transition-colors group-hover:text-white" />
                        </div>
                      </DataRow>
                    )
                  })}
                </div>
              ) : (
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.07] text-[10px] uppercase tracking-[0.14em] text-[#636366]">
                      <th className="px-4 py-2 font-medium">Rank</th>
                      <th className="px-4 py-2 font-medium">Activo</th>
                      <th className="px-4 py-2 text-right font-medium">Score</th>
                      <th className="px-4 py-2 text-right font-medium">Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sigList.map((s) => (
                      <tr
                        key={s.instrument}
                        onClick={() => setSelectedChartSymbol(s.instrument)}
                        className={cn(
                          'cursor-pointer border-b border-white/[0.05] transition-colors last:border-b-0 hover:bg-white/[0.03]',
                          activeSymbol === s.instrument && 'bg-white/[0.05]'
                        )}
                      >
                        <td className="px-4 py-2.5 text-[#636366]">#{s.rank}</td>
                        <td className="px-4 py-2.5 font-bold text-white">{s.instrument}</td>
                        <td className="tnum px-4 py-2.5 text-right text-[#D2D2D7]">
                          {s.score.toFixed(6)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span
                            className={cn(
                              'rounded px-1.5 py-px text-[9px] font-bold',
                              orderActionByInstrument.get(s.instrument)
                                ? 'badge-terminal-green'
                                : 'badge-terminal-neutral'
                            )}
                          >
                            {orderActionByInstrument.get(s.instrument) ?? 'TOP-K'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Reveal>

          {/* Gate verdict — editorial hairline block */}
          {evaluation && (
            <Reveal delay={0.08}>
              <div className="rounded-2xl border border-white/[0.07] bg-[#050507]/70 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#86868B]">
                    Control de backtest
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest',
                      evaluation.passed ? 'badge-terminal-green' : 'badge-terminal-red'
                    )}
                  >
                    {evaluation.passed ? 'Aprobado' : 'Rechazado'}
                  </span>
                </div>
                <dl className="divide-y divide-white/[0.05] font-mono text-xs">
                  {[
                    ['Umbral Mean IC', `≥ ${evaluation.thresholds?.min_mean_ic ?? 0}`],
                    ['Umbral ICIR', `≥ ${evaluation.thresholds?.min_icir ?? 0}`],
                    ['Retorno Top-K medio', `${(evaluation.avg_topk_fwd_return * 100).toFixed(3)}%`],
                    ['Retorno universo', `${(evaluation.avg_universe_fwd_return * 100).toFixed(3)}%`],
                    ['Evaluado', new Date(evaluation.evaluated_at).toLocaleDateString('es-CO')],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between py-2.5">
                      <dt className="text-[#86868B]">{k}</dt>
                      <dd className="tnum font-semibold text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
                {evaluation.failures && evaluation.failures.length > 0 && (
                  <p className="mt-3 font-mono text-[10px] leading-relaxed text-[#FF453A]">
                    {evaluation.failures.join(' · ')}
                  </p>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* 4. Order plan — dense hairline table, single exit to Execution */}
      {orders && orders.orders.length > 0 && (
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#050507]/70 backdrop-blur-xl">
            <div className="flex flex-col gap-4 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-white">
                  Plan de órdenes preparado
                </h3>
                <p className="mt-0.5 font-mono text-[10px] text-[#636366]">
                  asignación equal-weight del agente vibe · dry_run={String(orders.dry_run)} ·{' '}
                  {orders.currency}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="tnum font-mono text-xs text-[#A1A1A6]">
                  exposición{' '}
                  <strong className="text-white">
                    ${orders.totals.estimated_exposure.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </strong>{' '}
                  / ${orders.total_notional_target.toLocaleString('en-US')}
                </span>
                <Btn variant="secondary" size="sm" onClick={() => onNavigateToTab('execution')}>
                  <span>Mesa de ejecución</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Btn>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07] text-[10px] uppercase tracking-[0.14em] text-[#636366]">
                    <th className="px-5 py-2.5 font-medium">Acción</th>
                    <th className="px-5 py-2.5 font-medium">Instrumento</th>
                    <th className="px-5 py-2.5 text-right font-medium">Cantidad</th>
                    <th className="px-5 py-2.5 text-right font-medium">Precio est.</th>
                    <th className="px-5 py-2.5 text-right font-medium">Notional</th>
                    <th className="px-5 py-2.5 text-right font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.orders.map((o) => (
                    <tr
                      key={o.instrument}
                      className="border-b border-white/[0.05] transition-colors last:border-b-0 hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-3">
                        <span className="badge-terminal-green rounded px-2 py-0.5 text-[10px] font-bold">
                          {o.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-white">{o.instrument}</td>
                      <td className="tnum px-5 py-3 text-right text-[#D2D2D7]">{o.qty}</td>
                      <td className="tnum px-5 py-3 text-right text-[#86868B]">
                        ${o.est_price.toFixed(2)}
                      </td>
                      <td className="tnum px-5 py-3 text-right font-semibold text-white">
                        ${o.est_notional.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-[#636366]">
                        {o.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  )
}
