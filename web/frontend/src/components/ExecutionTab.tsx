import React, { useState } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  Layers,
} from 'lucide-react'
import type { OrdersPlan } from '../types'
import { executeOrders } from '../api'

interface ExecutionTabProps {
  orders: OrdersPlan | null
  onRefresh: () => void
}

export const ExecutionTab: React.FC<ExecutionTabProps> = ({ orders, onRefresh }) => {
  const [allowLive, setAllowLive] = useState(false)
  const [orderCmdTemplate, setOrderCmdTemplate] = useState('echo "SUBMITTED {symbol} qty={qty} est={est_price}"')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitOutput, setSubmitOutput] = useState<string | null>(null)

  const handleExecuteOrders = async () => {
    if (allowLive && !window.confirm('⚠️ ATENCIÓN: El envío real está activado. ¿Confirmas el envío de estas órdenes al broker?')) {
      return
    }

    setIsSubmitting(true)
    setSubmitOutput(null)
    try {
      const res = await executeOrders(allowLive, orderCmdTemplate)
      setSubmitOutput(res.stdout || (res.return_code === 0 ? 'Ejecución completada.' : res.stderr))
      onRefresh()
    } catch (err: any) {
      setSubmitOutput(`Error: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const orderList = orders?.orders || []

  return (
    <div className="space-y-6">
      {/* Execution Guardrails Banner */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-dark-600 pb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl border ${
                allowLive
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-400'
                  : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400'
              }`}
            >
              {allowLive ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm text-white flex items-center gap-2">
                Mesa de Ejecución & Guardarraíles de Vibe-Trading
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                    allowLive
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}
                >
                  {allowLive ? 'ENVÍO REAL ACTIVO' : 'MODO PAPEL (SIMULACIÓN)'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Por seguridad, QuantVibe nunca envía órdenes a brokers sin confirmación explícita (variable de entorno VIBE_ALLOW_ORDERS=1 y flag --submit).
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center space-x-3 bg-dark-900 p-2 rounded-lg border border-dark-700 self-end md:self-auto">
            <span className="text-xs font-mono text-slate-400">Modo Papel</span>
            <button
              type="button"
              onClick={() => setAllowLive(!allowLive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                allowLive ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  allowLive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-mono font-bold ${allowLive ? 'text-rose-400' : 'text-slate-400'}`}>
              Envío Real
            </span>
          </div>
        </div>

        {/* Live execution parameters if allowed */}
        {allowLive && (
          <div className="mt-4 p-4 rounded-lg bg-rose-950/20 border border-rose-800/40 space-y-3">
            <div className="flex items-center space-x-2 text-rose-300 text-xs font-mono font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>Doble Confirmación de Seguridad Activada</span>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Plantilla de Comando de Orden (Ej. CLI del broker o script):
              </label>
              <input
                type="text"
                value={orderCmdTemplate}
                onChange={(e) => setOrderCmdTemplate(e.target.value)}
                placeholder='order-cli buy --ticker {symbol} --amount {qty}'
                className="w-full bg-dark-900 border border-dark-700 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Variables disponibles: <code className="text-cyan-300">{'{symbol}'}</code>, <code className="text-cyan-300">{'{qty}'}</code>, <code className="text-cyan-300">{'{est_price}'}</code>
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 pt-3 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            Firma de señales vinculada:{' '}
            <span className="text-cyan-300 truncate inline-block max-w-[200px] align-bottom">
              {orders?.signals_checksum || 'N/A'}
            </span>
          </div>
          <button
            onClick={handleExecuteOrders}
            disabled={isSubmitting || orderList.length === 0}
            className={`flex items-center space-x-2 py-2 px-5 rounded-lg font-mono font-bold text-xs sm:text-sm text-white transition shadow-lg ${
              allowLive
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{allowLive ? 'Confirmar & Enviar Órdenes Reales' : 'Ejecutar Plan en Modo Papel'}</span>
          </button>
        </div>

        {/* Execution Output Box */}
        {submitOutput && (
          <div className="mt-4 p-3 rounded bg-dark-900 border border-dark-700 font-mono text-xs text-slate-300 whitespace-pre-wrap">
            <div className="font-bold text-cyan-400 mb-1">Respuesta del Ejecutor:</div>
            {submitOutput}
          </div>
        )}
      </div>

      {/* Orders Plan Table */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-dark-600 flex items-center justify-between bg-dark-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono font-semibold text-sm text-white">
              Órdenes Staged para Ejecución ({orderList.length} posiciones)
            </h3>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
            <div>
              Total Estimado:{' '}
              <span className="text-emerald-400 font-bold">
                ${orders?.totals.estimated_exposure.toFixed(2) || '0.00'} {orders?.currency || 'USD'}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-900/60 text-xs text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Acción</th>
                <th className="py-3 px-4">Instrumento</th>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Score ML</th>
                <th className="py-3 px-4">Precio Est.</th>
                <th className="py-3 px-4">Cantidad (Shares)</th>
                <th className="py-3 px-4">Notional Est.</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700 text-sm">
              {orderList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No hay plan de órdenes cargado.
                  </td>
                </tr>
              ) : (
                orderList.map((ord) => (
                  <tr key={ord.instrument} className="hover:bg-dark-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {ord.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white text-base">
                      {ord.instrument}
                    </td>
                    <td className="py-3 px-4 text-slate-400">#{ord.rank}</td>
                    <td className="py-3 px-4 text-slate-300">{ord.signal_score.toFixed(6)}</td>
                    <td className="py-3 px-4 text-slate-200">${ord.est_price.toFixed(4)}</td>
                    <td className="py-3 px-4 font-bold text-cyan-300">×{ord.qty}</td>
                    <td className="py-3 px-4 font-bold text-white">${ord.est_notional.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-xs bg-dark-900 text-slate-300 border border-dark-600">
                        {ord.status}
                      </span>
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
