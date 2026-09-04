import React, { useState } from 'react'
import {
  History,
  Percent,
  Search,
  ArrowUpRight,
  ArrowDownRight,
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

  return (
    <div className="space-y-6">
      {/* Models Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((m) => (
          <div
            key={m.source_model}
            className="bg-dark-800/80 border border-dark-600 rounded-xl p-5 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-dark-700 pb-2">
              <span className="font-mono font-bold text-sm text-cyan-300">
                {m.source_model}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {m.settled_signals}/{m.total_signals} liquidadas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono">
              <div>
                <span className="text-xs text-slate-400 block">Retorno Medio (1d)</span>
                <span
                  className={`text-lg font-bold flex items-center ${
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
                <span className="text-lg font-bold text-white flex items-center">
                  <Percent className="w-4 h-4 text-emerald-400 mr-1" />
                  {(m.hit_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Historical Ledger Table */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-dark-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-800">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono font-semibold text-sm text-white">
              Libro Mayor Histórico en SQLite (artifacts/track_record.db)
            </h3>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por símbolo, fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-900 border border-dark-700 rounded-lg pl-9 pr-4 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-900/60 text-xs text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Fecha (as_of)</th>
                <th className="py-3 px-4">Instrumento</th>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Modelo</th>
                <th className="py-3 px-4">Retorno Real (1d)</th>
                <th className="py-3 px-4 text-right">Exceso vs Universo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron registros de señales en la base de datos.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-dark-700/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-300">{r.as_of}</td>
                    <td className="py-2.5 px-4 font-bold text-cyan-300">{r.instrument}</td>
                    <td className="py-2.5 px-4 text-slate-400">#{r.rank}</td>
                    <td className="py-2.5 px-4 text-slate-300">{r.score.toFixed(6)}</td>
                    <td className="py-2.5 px-4 text-slate-400">{r.source_model}</td>
                    <td className="py-2.5 px-4">
                      {r.fwd_return_1d !== null ? (
                        <span
                          className={`font-semibold ${
                            r.fwd_return_1d >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {(r.fwd_return_1d * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Pendiente</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {r.excess_return !== null ? (
                        <span
                          className={`font-semibold ${
                            r.excess_return >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
