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
        colors: ['#FFFFFF', '#E8E8ED', '#86868B', '#30D158'],
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
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0C0C10] border border-white/[0.09] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-2xl border transition-all ${
                allowLive
                  ? 'bg-[#FF453A]/15 border-[#FF453A]/40 text-[#FF453A] shadow-lg shadow-[#FF453A]/15'
                  : 'bg-white/[0.06] border-white/[0.1] text-white shadow-lg'
              }`}
            >
              {allowLive ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <h3 className="text-xl font-bold text-[#F5F5F7] tracking-[-0.03em]">
                  Mesa de Ejecución del Agente
                </h3>
                <span
                  className={`px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                    allowLive
                      ? 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30'
                      : 'bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30'
                  }`}
                >
                  {allowLive ? 'Envío Real' : 'Modo Seguro (Papel)'}
                </span>
              </div>
              <p className="text-xs text-[#86868B] max-w-2xl leading-relaxed">
                El agente LLM de Vibe-Trading lee las señales firmadas vía MCP stdio y dimensiona un plan de órdenes equilibrado.
                Por arquitectura de seguridad, la ejecución a mercado está bloqueada salvo que se active manualmente la doble confirmación.
              </p>
            </div>
          </div>

          {/* Apple Physical Safety Toggle Switch */}
          <div className="flex items-center space-x-3 p-1.5 px-3.5 rounded-full bg-[#1C1C1E] border border-white/[0.08] self-start lg:self-auto">
            <span className="text-xs font-medium text-[#86868B]">Modo Papel</span>
            <button
              type="button"
              onClick={() => setAllowLive(!allowLive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                allowLive ? 'bg-[#FF453A]' : 'bg-[#3A3A3C]'
              }`}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform ${
                  allowLive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${allowLive ? 'text-[#FF453A]' : 'text-[#86868B]'}`}>
              Envío Real
            </span>
          </div>
        </div>

        {/* Live Submission Warning Box */}
        {allowLive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-5 rounded-2xl bg-[#1C1113] border border-[#FF453A]/30 space-y-3"
          >
            <div className="flex items-center space-x-2 text-[#FF453A] text-sm font-semibold">
              <AlertTriangle className="w-4 h-4 text-[#FF453A]" />
              <span>Advertencia de Envío Real a Mercado (Doble Candado Activo)</span>
            </div>
            <p className="text-xs text-[#D1D1D6] leading-relaxed">
              Las órdenes se enviarán al comando especificado abajo utilizando la variable de entorno{' '}
              <code className="px-1.5 py-0.5 rounded bg-black/60 text-white font-mono border border-white/10">VIBE_ALLOW_ORDERS=1</code>.
            </p>
            <div>
              <label className="block text-xs font-mono text-[#86868B] mb-1.5">
                Plantilla de Comando de Ejecución (Broker CLI o Wrapper API):
              </label>
              <input
                type="text"
                value={orderCmdTemplate}
                onChange={(e) => setOrderCmdTemplate(e.target.value)}
                placeholder='order-cli buy --ticker {symbol} --amount {qty}'
                className="w-full bg-black/50 border border-white/[0.1] rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </motion.div>
        )}

        {/* Exposure Progress Metrics - Apple Tiles */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#121216] border border-white/[0.08]">
            <span className="text-[11px] text-[#86868B] uppercase tracking-wider block font-medium">Capital Objetivo</span>
            <div className="text-2xl font-bold text-[#F5F5F7] tracking-tight mt-1 tnum">
              ${totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </div>
            <span className="text-[11px] text-[#86868B] mt-0.5 block">Ponderación igualitaria (Equal-Weight)</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121216] border border-white/[0.08]">
            <span className="text-[11px] text-[#86868B] uppercase tracking-wider block font-medium">Exposición Calculada</span>
            <div className="text-2xl font-bold text-[#F5F5F7] tracking-tight mt-1 tnum">
              ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </div>
            <span className="text-[11px] text-[#A1A1A6] mt-0.5 block">
              Utilización: {((estimatedTotal / totalTarget) * 100).toFixed(1)}% del capital
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121216] border border-white/[0.08]">
            <span className="text-[11px] text-[#86868B] uppercase tracking-wider block font-medium">Posiciones Staged</span>
            <div className="text-2xl font-bold text-[#30D158] tracking-tight mt-1 tnum">
              {orderList.length} Activos
            </div>
            <span className="text-[11px] text-[#86868B] mt-0.5 block">Estado: Listas para transmisión</span>
          </div>
        </div>

        {/* Execute Action Button */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-mono text-[#86868B] flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#F5F5F7]" />
            <span>Firma SHA-256 vinculada al lote</span>
          </div>

          <motion.button
            whileHover={{ scale: isSubmitting || orderList.length === 0 ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting || orderList.length === 0 ? 1 : 0.98 }}
            onClick={() => {
              if (allowLive) {
                setShowConfirmModal(true)
              } else {
                handleExecute()
              }
            }}
            disabled={isSubmitting || orderList.length === 0}
            className={`flex items-center justify-center space-x-2 px-8 py-3 rounded-full font-semibold text-xs sm:text-sm tracking-tight transition shadow-xl ${
              isSubmitting || orderList.length === 0
                ? 'bg-[#1C1C1E] text-[#86868B] cursor-not-allowed border border-white/[0.08]'
                : allowLive
                ? 'bg-[#FF453A] hover:bg-[#FF5F56] text-white shadow-[#FF453A]/20'
                : 'apple-btn-primary'
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
            className="mt-6 p-4 rounded-2xl bg-[#070709] border border-white/[0.1] font-mono text-xs text-[#D1D1D6]"
          >
            <div className="font-bold text-[#F5F5F7] mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
              Resultado de la Transmisión:
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed text-[#A1A1A6]">{submitOutput}</pre>
          </motion.div>
        )}
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-[#F5F5F7] tracking-tight flex items-center gap-2">
          <span>Órdenes Staged para Ejecución</span>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#D1D1D6] border border-white/[0.08]">
            {orderList.length} Órdenes
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {orderList.map((ord, idx) => (
            <motion.div
              key={ord.instrument}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 350, damping: 25 }}
              className="rounded-2xl p-5 bg-[#0C0C10] border border-white/[0.08] hover:border-white/[0.2] flex flex-col justify-between transition-all shadow-lg hover:shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
                    {ord.action}
                  </span>
                  <span className="text-xs font-mono text-[#86868B]">Rank #{ord.rank}</span>
                </div>

                <div className="text-2xl font-extrabold text-[#F5F5F7] tracking-tight">{ord.instrument}</div>
                <div className="text-xs text-[#86868B] font-mono mt-1">
                  Est: <span className="text-[#D1D1D6]">${ord.est_price.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#86868B]">Cantidad:</span>
                  <span className="font-bold text-[#F5F5F7] font-mono text-sm">×{ord.qty}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#86868B]">Notional:</span>
                  <span className="font-semibold text-[#D1D1D6] font-mono">${ord.est_notional.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal - Apple macOS Sheet Style */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="rounded-3xl p-7 max-w-md w-full bg-[#1C1C1E] border border-white/[0.15] shadow-2xl space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FF453A]/15 border border-[#FF453A]/30 flex items-center justify-center text-[#FF453A]">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#F5F5F7] tracking-tight">¿Confirmas la Transmisión Real a Mercado?</h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Estás a punto de emitir {orderList.length} órdenes reales con una exposición calculada de $
                  {estimatedTotal.toFixed(2)} USD. Verifica que tu entorno de broker y variables sean seguras.
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-[#F5F5F7] transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExecute}
                  className="flex-1 py-2.5 rounded-full bg-[#FF453A] hover:bg-[#FF5F56] text-xs font-bold text-white shadow-lg shadow-[#FF453A]/25 transition"
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
