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
            className="rounded-3xl p-6 bg-[#0C0C10] border border-white/[0.08] hover:border-white/[0.18] shadow-2xl relative overflow-hidden group transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-[#F5F5F7] tracking-tight">
                  {m.source_model}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#A1A1A6] border border-white/[0.08]">
                {m.settled_signals}/{m.total_signals} liquidadas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-[#86868B] uppercase tracking-wider block font-medium">Retorno Medio (1d)</span>
                <span
                  className={`text-xl font-bold font-mono flex items-center mt-1.5 ${
                    m.avg_return_1d >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'
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
                <span className="text-[11px] text-[#86868B] uppercase tracking-wider block font-medium">Hit-Rate Real</span>
                <span className="text-xl font-bold font-mono text-[#F5F5F7] flex items-center mt-1.5">
                  <Percent className="w-4 h-4 text-[#30D158] mr-1" />
                  {(m.hit_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Micro curve preview if equity points exist */}
            {equityPoints.length > 1 && (
              <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#86868B]">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-white/70" />
                  Curva de Capital Reciente
                </span>
                <span className="font-mono text-[#30D158] font-bold">
                  +{((cumulative - 1) * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Historical Ledger Table Card */}
      <div className="rounded-3xl overflow-hidden bg-[#0C0C10] border border-white/[0.09] shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

        <div className="p-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F5F5F7] tracking-tight">
                Libro Mayor Histórico de Auditoría
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                Almacenado inmutable en <code className="text-[#D1D1D6] font-mono">artifacts/track_record.db</code> con liquidación de precios reales.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-[#86868B]" />
            <input
              type="text"
              placeholder="Buscar activo, fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/50 border border-white/[0.1] rounded-full pl-9 pr-4 py-1.5 text-xs font-mono text-white placeholder-[#86868B] focus:outline-none focus:border-white/30 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-[#86868B] uppercase tracking-wider">
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
                  <td colSpan={7} className="py-12 text-center text-[#86868B] font-sans text-sm">
                    No se encontraron registros de señales en la base de datos de auditoría.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 text-[#A1A1A6]">{r.as_of}</td>
                    <td className="py-3.5 px-5 font-bold text-[#F5F5F7] text-sm">{r.instrument}</td>
                    <td className="py-3.5 px-5 text-[#86868B]">#{r.rank}</td>
                    <td className="py-3.5 px-5 text-[#D1D1D6] tnum">{r.score.toFixed(4)}</td>
                    <td className="py-3.5 px-5 text-[#86868B]">{r.source_model}</td>
                    <td className="py-3.5 px-5">
                      {r.fwd_return_1d !== null ? (
                        <span
                          className={`font-semibold px-2.5 py-0.5 rounded-full ${
                            r.fwd_return_1d >= 0
                              ? 'bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30'
                              : 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30'
                          }`}
                        >
                          {(r.fwd_return_1d * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-[#86868B] italic">Pendiente</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {r.excess_return !== null ? (
                        <span
                          className={`font-semibold px-2.5 py-0.5 rounded-full ${
                            r.excess_return >= 0
                              ? 'bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30'
                              : 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30'
                          }`}
                        >
                          {(r.excess_return * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-[#86868B]">—</span>
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
