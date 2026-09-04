import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  AlertTriangle,
  Lock,
  CheckCircle2,
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
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleExecute = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)
    setSubmitOutput(null)
    try {
      const res = await executeOrders(allowLive, orderCmdTemplate)
      setSubmitOutput(res.stdout || (res.return_code === 0 ? 'Ejecución de plan completada con éxito.' : res.stderr))
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#10B981', '#00F2FE', '#8B5CF6'],
      })
      onRefresh()
    } catch (err: any) {
      setSubmitOutput(`Error: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const orderList = orders?.orders || []
  const totalTarget = orders?.total_notional_target || 10000
  const estimatedTotal = orders?.totals.estimated_exposure || 0

  return (
    <div className="space-y-8 font-sans">
      {/* Cockpit Header & Safety Guardrail */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-2xl border transition-all ${
                allowLive
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/20'
                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {allowLive ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Mesa de Ejecución del Agente Vibe-Trading
                </h3>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    allowLive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {allowLive ? 'Envío Real' : 'Modo Seguro (Papel)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                El agente LLM de Vibe-Trading lee las señales firmadas vía MCP stdio y dimensiona un plan de órdenes equilibrado.
                Por arquitectura de seguridad, la ejecución a mercado está bloqueada salvo que se active manualmente la doble confirmación.
              </p>
            </div>
          </div>

          {/* Apple-style Sliding Safety Toggle Switch */}
          <div className="flex items-center space-x-3 p-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] self-start lg:self-auto">
            <span className="text-xs font-medium text-slate-400">Modo Papel</span>
            <button
              type="button"
              onClick={() => setAllowLive(!allowLive)}
              className={`relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                allowLive ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transform ${
                  allowLive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${allowLive ? 'text-rose-400' : 'text-slate-400'}`}>
              Envío Real
            </span>
          </div>
        </div>

        {/* Live Submission Warning Box */}
        {allowLive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-3"
          >
            <div className="flex items-center space-x-2 text-rose-300 text-sm font-semibold">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Advertencia de Envío Real a Mercado (Doble Candado Activo)</span>
            </div>
            <p className="text-xs text-slate-300">
              Las órdenes se enviarán al comando especificado abajo utilizando la variable de entorno{' '}
              <code className="px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 font-mono">VIBE_ALLOW_ORDERS=1</code>.
            </p>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Plantilla de Comando de Ejecución (Broker CLI o Wrapper API):
              </label>
              <input
                type="text"
                value={orderCmdTemplate}
                onChange={(e) => setOrderCmdTemplate(e.target.value)}
                placeholder='order-cli buy --ticker {symbol} --amount {qty}'
                className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </motion.div>
        )}

        {/* Exposure Progress Metrics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl glass-card border border-white/[0.06]">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Capital Objetivo</span>
            <div className="text-2xl font-bold text-white tracking-tight mt-1 tnum">
              ${totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </div>
            <span className="text-[11px] text-slate-400">Ponderación igualitaria (Equal-Weight)</span>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-white/[0.06]">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Exposición Calculada</span>
            <div className="text-2xl font-bold text-cyan-300 tracking-tight mt-1 tnum">
              ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </div>
            <span className="text-[11px] text-cyan-400/80">
              Utilización: {((estimatedTotal / totalTarget) * 100).toFixed(1)}% del capital
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-white/[0.06]">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Posiciones Staged</span>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight mt-1 tnum">
              {orderList.length} Activos
            </div>
            <span className="text-[11px] text-slate-400">Estado: Listas para transmisión</span>
          </div>
        </div>

        {/* Execute Action Button */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Firma SHA-256 vinculada al lote</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (allowLive) {
                setShowConfirmModal(true)
              } else {
                handleExecute()
              }
            }}
            disabled={isSubmitting || orderList.length === 0}
            className={`flex items-center space-x-2 px-7 py-3 rounded-xl font-bold text-xs sm:text-sm text-white tracking-wide transition shadow-xl ${
              allowLive
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-900/30'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-cyan-500/25'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{allowLive ? 'Transmitir Órdenes a Mercado' : 'Simular Plan en Cuenta Sombra'}</span>
          </motion.button>
        </div>

        {/* Execution Output Feedback */}
        {submitOutput && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-2xl bg-black/40 border border-white/[0.08] font-mono text-xs text-slate-300"
          >
            <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Resultado de la Transmisión:
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed text-slate-300">{submitOutput}</pre>
          </motion.div>
        )}
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span>Órdenes Staged para Ejecución</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">
            {orderList.length} Órdenes
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {orderList.map((ord, idx) => (
            <motion.div
              key={ord.instrument}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card-interactive rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {ord.action}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Rank #{ord.rank}</span>
                </div>

                <div className="text-2xl font-extrabold text-white tracking-tight">{ord.instrument}</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Precio Estimado: <span className="text-slate-200">${ord.est_price.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Cantidad:</span>
                  <span className="font-bold text-cyan-300 font-mono text-sm">×{ord.qty} shares</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Notional:</span>
                  <span className="font-bold text-white font-mono">${ord.est_notional.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel rounded-3xl p-6 max-w-md w-full border border-rose-500/40 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white">¿Confirmas la Transmisión Real a Mercado?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Estás a punto de emitir {orderList.length} órdenes reales con una exposición de $
                {estimatedTotal.toFixed(2)} USD. Verifica que tu entorno de broker y parámetros sean correctos.
              </p>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExecute}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-900/30 transition"
                >
                  Confirmar & Enviar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
