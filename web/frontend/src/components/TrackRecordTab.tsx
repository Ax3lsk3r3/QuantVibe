import React, { useState, useMemo } from 'react'
import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { TrackRecordResponse } from '../types'
import { Eyebrow, MetricRail, StatusDot, cn } from './ui'

interface TrackRecordTabProps {
  trackRecord: TrackRecordResponse | null
}

export const TrackRecordTab: React.FC<TrackRecordTabProps> = ({ trackRecord }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const models = trackRecord?.models ?? []
  const records = useMemo(() => trackRecord?.records ?? [], [trackRecord])

  const filteredRecords = records.filter(
    (r) =>
      r.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.as_of.includes(searchTerm) ||
      r.source_model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  /* Illustrative cumulative equity curve from settled records */
  const settledPoints = useMemo(
    () =>
      records
        .filter((r) => r.fwd_return_1d !== null)
        .slice(0, 30)
        .reverse(),
    [records]
  )

  const cumulativeTotal = useMemo(() => {
    let cumulative = 1.0
    settledPoints.forEach((r) => {
      cumulative *= 1 + (r.fwd_return_1d || 0)
    })
    return cumulative
  }, [settledPoints])

  const totalSettled = models.reduce((acc, m) => acc + m.settled_signals, 0)
  const totalSignals = models.reduce((acc, m) => acc + m.total_signals, 0)
  const avgReturn = models.length
    ? models.reduce((acc, m) => acc + m.avg_return_1d * m.settled_signals, 0) /
      Math.max(totalSettled, 1)
    : 0

  return (
    <div className="space-y-10 font-sans">
      {/* 1. Editorial head */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Eyebrow>
            <span className="flex items-center gap-2">
              <StatusDot tone={trackRecord?.has_db ? 'pos' : 'muted'} ping={trackRecord?.has_db} />
              Auditoría histórica · ledger SQLite
            </span>
          </Eyebrow>
          <h1 className="mt-3 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
            Cada retorno, <em className="italic text-[#6E6E73]">liquidado y sellado.</em>
          </h1>
          <p className="editorial-subhead mt-3 max-w-2xl text-sm leading-relaxed text-[#86868B]">
            Libro mayor inmutable en{' '}
            <code className="font-mono text-[#D1D1D6]">artifacts/track_record.db</code> con
            liquidación de precios reales y exceso de retorno frente a la mediana del universo.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#636366]" />
          <input
            type="text"
            placeholder="Buscar activo, fecha o modelo…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar en el ledger"
            className="w-full rounded-full border border-white/[0.1] bg-black/50 py-2 pl-9 pr-4 font-mono text-xs text-white placeholder-[#636366] transition-colors focus:border-white/30 focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Audit summary rail */}
      <MetricRail
        cols={4}
        items={[
          {
            label: 'Señales liquidadas',
            value: `${totalSettled} / ${totalSignals}`,
            sub: 'con retorno forward real',
          },
          {
            label: 'Retorno medio (1d)',
            value: `${avgReturn >= 0 ? '+' : ''}${(avgReturn * 100).toFixed(3)}%`,
            sub: 'ponderado por modelo',
            tone: avgReturn >= 0 ? 'pos' : 'neg',
          },
          {
            label: 'Curva reciente (30)',
            value: `${cumulativeTotal >= 1 ? '+' : ''}${((cumulativeTotal - 1) * 100).toFixed(2)}%`,
            sub: settledPoints.length > 0 ? 'compuesto sobre liquidadas' : 'sin datos aún',
            tone: cumulativeTotal >= 1 ? 'pos' : 'neg',
          },
          {
            label: 'Modelos auditados',
            value: `${models.length}`,
            sub: 'agrupados por source_model',
          },
        ]}
      />

      {/* 3. Model performance — dense hairline rows (anti-card) */}
      {models.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#050507]/70 backdrop-blur-xl">
          <div className="border-b border-white/[0.07] px-5 py-3.5">
            <h3 className="text-sm font-semibold tracking-tight text-white">
              Desempeño por modelo
            </h3>
          </div>
          {models.map((m) => (
            <div
              key={m.source_model}
              className="group grid grid-cols-2 items-center gap-4 border-b border-white/[0.06] px-5 py-4 transition-colors last:border-b-0 hover:bg-white/[0.025] md:grid-cols-12"
            >
              <div className="col-span-2 flex items-center gap-3 md:col-span-4">
                <StatusDot tone={m.avg_return_1d >= 0 ? 'pos' : 'neg'} />
                <span className="truncate font-mono text-sm font-bold text-white">
                  {m.source_model}
                </span>
              </div>
              <div className="font-mono text-xs text-[#86868B] md:col-span-3">
                <span className="tnum text-[#D2D2D7]">
                  {m.settled_signals}/{m.total_signals}
                </span>{' '}
                liquidadas
              </div>
              <div
                className={cn(
                  'tnum flex items-center font-mono text-sm font-bold',
                  m.avg_return_1d >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'
                )}
                md:col-span-3
              >
                {m.avg_return_1d >= 0 ? (
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                )}
                {(m.avg_return_1d * 100).toFixed(3)}%/día
              </div>
              <div className="tnum text-right font-mono text-sm font-bold text-white md:col-span-2">
                {(m.hit_rate * 100).toFixed(1)}%{' '}
                <span className="text-[10px] font-medium text-[#636366]">hit</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Historical ledger — dense terminal table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#050507]/70 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
          <h3 className="text-sm font-semibold tracking-tight text-white">
            Libro mayor histórico de auditoría
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#636366]">
            {filteredRecords.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.015] font-mono text-[10px] uppercase tracking-[0.14em] text-[#636366]">
                <th className="px-5 py-3 font-medium">Fecha (as_of)</th>
                <th className="px-5 py-3 font-medium">Activo</th>
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-5 py-3 text-right font-medium">Score Qlib</th>
                <th className="px-5 py-3 font-medium">Modelo</th>
                <th className="px-5 py-3 text-right font-medium">Retorno real (1d)</th>
                <th className="px-5 py-3 text-right font-medium">Exceso vs universo</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center font-sans text-sm text-[#636366]">
                    {trackRecord?.has_db
                      ? 'Sin registros que coincidan con la búsqueda.'
                      : 'Aún no hay señales liquidadas en la base de auditoría.'}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr
                    key={`${r.instrument}-${r.as_of}-${idx}`}
                    className="border-b border-white/[0.05] transition-colors last:border-b-0 hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-3 text-[#A1A1A6]">{r.as_of}</td>
                    <td className="px-5 py-3 text-sm font-bold text-white">{r.instrument}</td>
                    <td className="px-5 py-3 text-[#636366]">#{r.rank}</td>
                    <td className="tnum px-5 py-3 text-right text-[#D1D1D6]">
                      {r.score.toFixed(4)}
                    </td>
                    <td className="max-w-[160px] truncate px-5 py-3 text-[#86868B]">
                      {r.source_model}
                    </td>
                    <td
                      className={cn(
                        'tnum px-5 py-3 text-right font-bold',
                        r.fwd_return_1d === null
                          ? 'text-[#48484A]'
                          : r.fwd_return_1d >= 0
                          ? 'text-[#30D158]'
                          : 'text-[#FF453A]'
                      )}
                    >
                      {r.fwd_return_1d !== null
                        ? `${r.fwd_return_1d >= 0 ? '+' : ''}${(r.fwd_return_1d * 100).toFixed(2)}%`
                        : 'pendiente'}
                    </td>
                    <td
                      className={cn(
                        'tnum px-5 py-3 text-right font-semibold',
                        r.excess_return === null
                          ? 'text-[#48484A]'
                          : r.excess_return >= 0
                          ? 'text-[#30D158]'
                          : 'text-[#FF453A]'
                      )}
                    >
                      {r.excess_return !== null
                        ? `${r.excess_return >= 0 ? '+' : ''}${(r.excess_return * 100).toFixed(2)}%`
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
