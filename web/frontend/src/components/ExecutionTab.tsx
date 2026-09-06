import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { ShieldAlert, Send, Lock } from 'lucide-react'
import type { OrdersPlan } from '../types'
import { executeOrders } from '../api'
import { Btn, Eyebrow, MetricRail, StatusDot, cn } from './ui'

interface ExecutionTabProps {
  orders: OrdersPlan | null
  onRefresh: () => void
}

export const ExecutionTab: React.FC<ExecutionTabProps> = ({ orders, onRefresh }) => {
  const [allowLive, setAllowLive] = useState(false)
  const [orderCmdTemplate, setOrderCmdTemplate] = useState(
    'echo "SUBMITTED {symbol} qty={qty} est={est_price}"'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitOutput, setSubmitOutput] = useState<{ text: string; ok: boolean } | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleExecute = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)
    setSubmitOutput(null)
    try {
      const res = await executeOrders(allowLive, orderCmdTemplate)
      const ok = res.return_code === 0
      setSubmitOutput({
        text: res.stdout || (ok ? 'Ejecución del plan completada con éxito.' : res.stderr || 'Proceso finalizado con código distinto de cero.'),
        ok,
      })
      if (ok) {
        confetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#FFFFFF', '#E8E8ED', '#86868B', '#30D158'],
        })
      }
      onRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setSubmitOutput({ text: `Error de transmisión: ${message}`, ok: false })
    } finally {
      setIsSubmitting(false)
    }
  }

  const orderList = orders?.orders ?? []
  const totalTarget = orders?.total_notional_target ?? 0
  const estimatedTotal = orders?.totals?.estimated_exposure ?? 0
  const utilization = totalTarget > 0 ? (estimatedTotal / totalTarget) * 100 : 0

  return (
    <div className="space-y-10 font-sans">
      {/* 1. Editorial cockpit head */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Eyebrow>
            <span className="flex items-center gap-2">
              <StatusDot tone={allowLive ? 'neg' : 'pos'} ping={allowLive} />
              Mesa de órdenes · agente vibe-trading
            </span>
          </Eyebrow>
          <h1 className="mt-3 font-sans text-4xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl">
            Ejecución con <span className="text-[#86868B] font-semibold">doble candado.</span>
          </h1>
          <p className="editorial-subhead mt-3 max-w-2xl text-sm leading-relaxed text-[#86868B]">
            El agente LLM lee las señales firmadas vía MCP stdio y dimensiona un plan equilibrado.
            Por arquitectura de seguridad, el envío a mercado está bloqueado salvo activación manual
            explícita de la doble confirmación.
          </p>
        </div>

        {/* Physical safety toggle */}
        <div
          className={cn(
            'flex shrink-0 items-center gap-3 self-start rounded-full border p-1.5 pl-4 transition-colors lg:self-auto',
            allowLive ? 'border-[#FF453A]/40 bg-[#FF453A]/[0.07]' : 'border-white/[0.08] bg-white/[0.03]'
          )}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#86868B]">
            Papel
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={allowLive}
            aria-label="Activar envío real a mercado"
            onClick={() => setAllowLive(!allowLive)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200',
              allowLive ? 'bg-[#FF453A]' : 'bg-[#3A3A3C]'
            )}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn(
                'inline-block h-5 w-5 rounded-full bg-white shadow-md',
                allowLive ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
          <span
            className={cn(
              'pr-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em]',
              allowLive ? 'text-[#FF453A]' : 'text-[#86868B]'
            )}
          >
            Real
          </span>
        </div>
      </div>

      {/* Live submission warning (error-prevention state) */}
      <AnimatePresence>
        {allowLive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 rounded-2xl border border-[#FF453A]/30 bg-[#FF453A]/[0.05] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FF453A]">
                <ShieldAlert className="h-4 w-4" />
                <span>Advertencia de envío real a mercado (doble candado activo)</span>
              </div>
              <p className="text-xs leading-relaxed text-[#D1D1D6]">
                Las órdenes se enviarán al comando especificado utilizando la variable de entorno{' '}
                <code className="rounded border border-white/10 bg-black/60 px-1.5 py-0.5 font-mono text-white">
                  VIBE_ALLOW_ORDERS=1
                </code>
                . Verifica tu entorno de broker antes de transmitir.
              </p>
              <div>
                <label
                  htmlFor="order-cmd-template"
                  className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-[#86868B]"
                >
                  Plantilla de comando de ejecución (broker CLI o wrapper API)
                </label>
                <input
                  id="order-cmd-template"
                  type="text"
                  value={orderCmdTemplate}
                  onChange={(e) => setOrderCmdTemplate(e.target.value)}
                  placeholder="order-cli buy --ticker {symbol} --amount {qty}"
                  className="w-full rounded-xl border border-white/[0.1] bg-black/50 px-4 py-2.5 font-mono text-xs text-white placeholder-[#636366] transition-colors focus:border-white/40 focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Exposure metric rail */}
      <MetricRail
        cols={4}
        items={[
          {
            label: 'Capital objetivo',
            value: `$${totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            sub: 'ponderación equal-weight',
          },
          {
            label: 'Exposición calculada',
            value: `$${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            sub: `${utilization.toFixed(1)}% del capital`,
          },
          {
            label: 'Posiciones staged',
            value: `${orderList.length} activos`,
            sub: 'listas para transmisión',
            tone: orderList.length > 0 ? 'pos' : 'muted',
          },
          {
            label: 'Firma del lote',
            value: orders?.signals_checksum ? `${orders.signals_checksum.slice(0, 12)}…` : '—',
            sub: 'SHA-256 vinculado',
          },
        ]}
      />

      {/* 3. Staged orders — dense terminal table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#050507]/70 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <h3 className="text-sm font-semibold tracking-tight text-white">
            Órdenes staged para ejecución
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#636366]">
            {orderList.length} órdenes
          </span>
        </div>

        {orderList.length === 0 ? (
          <div className="py-16 text-center">
            <Lock className="mx-auto mb-2 h-7 w-7 text-[#2C2C2E]" />
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#636366]">
              Sin plan de órdenes · ejecuta el pipeline primero
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/[0.07] text-[10px] uppercase tracking-[0.14em] text-[#636366]">
                  <th className="px-5 py-2.5 font-medium">Acción</th>
                  <th className="px-5 py-2.5 font-medium">Instrumento</th>
                  <th className="px-5 py-2.5 font-medium">Rank</th>
                  <th className="px-5 py-2.5 text-right font-medium">Cantidad</th>
                  <th className="px-5 py-2.5 text-right font-medium">Precio est.</th>
                  <th className="px-5 py-2.5 text-right font-medium">Notional</th>
                </tr>
              </thead>
              <tbody>
                {orderList.map((ord, idx) => (
                  <motion.tr
                    key={ord.instrument}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                    className="border-b border-white/[0.05] transition-colors last:border-b-0 hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-3">
                      <span className="badge-terminal-green rounded px-2 py-0.5 text-[10px] font-bold">
                        {ord.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-white">{ord.instrument}</td>
                    <td className="px-5 py-3 text-[#636366]">#{ord.rank}</td>
                    <td className="tnum px-5 py-3 text-right text-[#D2D2D7]">×{ord.qty}</td>
                    <td className="tnum px-5 py-3 text-right text-[#86868B]">
                      ${ord.est_price.toFixed(2)}
                    </td>
                    <td className="tnum px-5 py-3 text-right font-semibold text-white">
                      ${ord.est_notional.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Transmit bar */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#636366]">
            <Lock className="h-3 w-3 text-[#A1A1A6]" />
            Firma SHA-256 vinculada al lote
          </span>
          <Btn
            variant={allowLive ? 'danger' : 'primary'}
            size="md"
            loading={isSubmitting}
            disabled={isSubmitting || orderList.length === 0}
            onClick={() => (allowLive ? setShowConfirmModal(true) : handleExecute())}
          >
            {!isSubmitting && <Send className="h-4 w-4" />}
            <span>
              {isSubmitting
                ? 'Transmitiendo…'
                : allowLive
                ? 'Transmitir órdenes a mercado'
                : 'Simular plan en cuenta sombra'}
            </span>
          </Btn>
        </div>
      </div>

      {/* 4. Transmission output — explicit success/error state */}
      <AnimatePresence>
        {submitOutput && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'overflow-hidden rounded-2xl border bg-[#030304]/90 backdrop-blur-xl',
              submitOutput.ok ? 'border-[#30D158]/25' : 'border-[#FF453A]/30'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2 border-b px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em]',
                submitOutput.ok
                  ? 'border-[#30D158]/20 text-[#30D158]'
                  : 'border-[#FF453A]/25 text-[#FF453A]'
              )}
            >
              <StatusDot tone={submitOutput.ok ? 'pos' : 'neg'} />
              {submitOutput.ok ? 'Transmisión completada' : 'Transmisión fallida'}
            </div>
            <pre className="max-h-64 overflow-y-auto px-5 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#A1A1A6]">
              {submitOutput.text}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Confirmation modal — glass sheet */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel specular-hairline w-full max-w-md space-y-5 rounded-3xl p-7"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-live-title"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FF453A]/30 bg-[#FF453A]/10 text-[#FF453A]">
                <ShieldAlert className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 id="confirm-live-title" className="text-lg font-bold tracking-tight text-[#F5F5F7]">
                  ¿Confirmas la transmisión real a mercado?
                </h3>
                <p className="text-xs leading-relaxed text-[#86868B]">
                  Estás a punto de emitir {orderList.length} órdenes reales con una exposición
                  calculada de ${estimatedTotal.toFixed(2)} USD mediante el comando configurado.
                  Verifica que tu entorno de broker sea seguro.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <Btn
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancelar
                </Btn>
                <Btn variant="danger" className="flex-1" loading={isSubmitting} onClick={handleExecute}>
                  {!isSubmitting && <Send className="h-3.5 w-3.5" />}
                  <span>Confirmar & enviar</span>
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
