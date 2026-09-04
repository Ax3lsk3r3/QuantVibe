import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Percent,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  History,
  Activity,
} from 'lucide-react'
import type { TrackRecordResponse } from '../types'

interface TrackRecordTabProps {
  trackRecord: TrackRecordResponse | null
}

export const TrackRecordTab: React.FC<TrackRecordTabProps> = ({ trackRecord }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const models = trackRecord?.models || []
  const records = trackRecord?.records || []

  const filteredRecords = records.filter(
    (r) =>
      r.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.as_of.includes(searchTerm) ||
      r.source_model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Generate an illustrative cumulative equity curve from settled records
  const settledPoints = records
    .filter((r) => r.fwd_return_1d !== null)
    .slice(0, 30)
    .reverse()

  let cumulative = 1.0
  const equityPoints = settledPoints.map((r) => {
    cumulative *= 1 + (r.fwd_return_1d || 0)
    return cumulative
  })

  return (
    <div className="space-y-8 font-sans">
      {/* Top Models Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {models.map((m) => (
          <motion.div
            key={m.source_model}
            whileHover={{ y: -3 }}
            className="glass-panel rounded-3xl p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden group"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white tracking-tight">
                  {m.source_model}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">
                {m.settled_signals}/{m.total_signals} liquidadas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Retorno Medio (1d)</span>
                <span
                  className={`text-xl font-bold font-mono flex items-center mt-1 ${
                    m.avg_return_1d >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {m.avg_return_1d >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-0.5" />
                  )}
                  {(m.avg_return_1d * 100).toFixed(3)}%/día
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Hit-Rate Real</span>
                <span className="text-xl font-bold font-mono text-white flex items-center mt-1">
                  <Percent className="w-4 h-4 text-emerald-400 mr-1" />
                  {(m.hit_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Micro curve preview if equity points exist */}
            {equityPoints.length > 1 && (
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Curva de Capital Reciente
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  +{((cumulative - 1) * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Historical Ledger Table Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="p-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Libro Mayor Histórico de Auditoría (SQLite)
              </h3>
              <p className="text-xs text-slate-400">
                Almacenado inmutable en <code className="text-cyan-300">artifacts/track_record.db</code> con liquidación de precios reales.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar activo, fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Fecha (as_of)</th>
                <th className="py-3.5 px-5">Activo</th>
                <th className="py-3.5 px-5">Rank</th>
                <th className="py-3.5 px-5">Score Qlib</th>
                <th className="py-3.5 px-5">Modelo</th>
                <th className="py-3.5 px-5">Retorno Real (1d)</th>
                <th className="py-3.5 px-5 text-right">Exceso vs Universo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs font-mono">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans text-sm">
                    No se encontraron registros de señales en la base de datos de auditoría.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-5 text-slate-300">{r.as_of}</td>
                    <td className="py-3 px-5 font-bold text-cyan-300 text-sm">{r.instrument}</td>
                    <td className="py-3 px-5 text-slate-400">#{r.rank}</td>
                    <td className="py-3 px-5 text-slate-300 tnum">{r.score.toFixed(4)}</td>
                    <td className="py-3 px-5 text-slate-400">{r.source_model}</td>
                    <td className="py-3 px-5">
                      {r.fwd_return_1d !== null ? (
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full ${
                            r.fwd_return_1d >= 0
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {(r.fwd_return_1d * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Pendiente</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      {r.excess_return !== null ? (
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full ${
                            r.excess_return >= 0
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {(r.excess_return * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
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
