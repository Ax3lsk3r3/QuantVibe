import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { CounterNumber } from './CounterNumber'
import { Btn, Eyebrow, StatusDot, cn } from '../ui'

interface InteractiveSimulatorProps {
  onNavigateToTab: (tab: string) => void
}

interface FactorModel {
  id: string
  name: string
  desc: string
  baseSharpe: number
  baseIC: number
  baseAlpha: number
  baseDrawdown: number
  bias: Record<string, number>
}

const MODELS: FactorModel[] = [
  {
    id: 'alpha158',
    name: 'Alpha158 Multi-Factor',
    desc: '158 factores continuos de Qlib (momentum, volumen, spreads)',
    baseSharpe: 2.45,
    baseIC: 0.082,
    baseAlpha: 26.8,
    baseDrawdown: -7.8,
    bias: { NVDA: 0.2, AAPL: 0.18, MSFT: 0.17, AMD: 0.15, GOOGL: 0.16, TSLA: 0.14 },
  },
  {
    id: 'momentum',
    name: 'Momentum Breakout',
    desc: 'LightGBM optimizado para capturar aceleración tendencial',
    baseSharpe: 2.68,
    baseIC: 0.094,
    baseAlpha: 32.4,
    baseDrawdown: -10.2,
    bias: { NVDA: 0.2, TSLA: 0.2, AMD: 0.18, AAPL: 0.15, MSFT: 0.14, GOOGL: 0.13 },
  },
  {
    id: 'mean_reversion',
    name: 'StatArb Mean-Reversion',
    desc: 'Reversión a la media con normalización de volatilidad',
    baseSharpe: 2.25,
    baseIC: 0.071,
    baseAlpha: 21.2,
    baseDrawdown: -5.4,
    bias: { MSFT: 0.2, GOOGL: 0.19, AAPL: 0.18, NVDA: 0.16, AMD: 0.14, TSLA: 0.13 },
  },
]

export const InteractiveSimulator: React.FC<InteractiveSimulatorProps> = ({ onNavigateToTab }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('alpha158')
  const [riskBudget, setRiskBudget] = useState<number>(14)
  const [topK, setTopK] = useState<number>(5)

  const activeModel = useMemo(
    () => MODELS.find((m) => m.id === selectedModelId) || MODELS[0],
    [selectedModelId]
  )

  const metrics = useMemo(() => {
    const riskFactor = riskBudget / 14
    const sharpe = activeModel.baseSharpe * (1 + (riskBudget - 14) * 0.015)
    const ic = activeModel.baseIC * (1 + (topK - 4) * 0.02)
    const alpha = activeModel.baseAlpha * riskFactor
    const drawdown = activeModel.baseDrawdown * (riskBudget / 12)
    return { sharpe, ic, alpha, drawdown }
  }, [activeModel, riskBudget, topK])

  const allocation = useMemo(() => {
    const rawEntries = Object.entries(activeModel.bias).slice(0, topK)
    const sum = rawEntries.reduce((acc, [, w]) => acc + w, 0)
    return rawEntries.map(([ticker, w]) => {
      const normalizedWeight = Math.min(20, Math.round((w / sum) * 100 * 10) / 10)
      return {
        ticker,
        weight: normalizedWeight,
        score: (0.75 + w * 0.8).toFixed(3),
      }
    })
  }, [activeModel, topK])

  return (
    <div className="w-full">
      {/* Editorial head */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Eyebrow>Laboratorio de factores interactivo · simulación</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
            Simula tu portafolio institucional{' '}
            <em className="italic text-[#6E6E73]">en tiempo real.</em>
          </h2>
          <p className="editorial-subhead mt-4 max-w-xl text-sm leading-relaxed text-[#86868B]">
            Ajusta estrategia, presupuesto de riesgo y concentración para observar cómo el cerebro
            Qlib recalcula la frontera eficiente — con el invariante de 20% siempre activo.
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-2 self-start rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#A1A1A6] lg:self-auto">
          <StatusDot tone="pos" ping /> Simulador reactivo v2.4
        </span>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Controls column */}
        <div className="space-y-8 lg:col-span-5">
          <div>
            <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-[#86868B]">
              01 · Estrategia de factor mining
            </span>
            <div className="border-t border-white/[0.07]">
              {MODELS.map((model) => {
                const isSelected = model.id === selectedModelId
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModelId(model.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex w-full items-start justify-between gap-3 border-b border-white/[0.07] px-3 py-4 text-left transition-colors',
                      isSelected ? 'bg-white/[0.045]' : 'hover:bg-white/[0.02]'
                    )}
                  >
                    <span className="min-w-0">
                      <span
                        className={cn(
                          'block text-sm font-semibold tracking-tight',
                          isSelected ? 'text-white' : 'text-[#D2D2D7]'
                        )}
                      >
                        {model.name}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-[#86868B]">
                        {model.desc}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                        isSelected ? 'border-white bg-white text-black' : 'border-white/20 text-transparent'
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#86868B]">
                02 · Volatilidad anual objetivo
              </span>
              <span className="tnum font-mono text-sm font-bold text-white">{riskBudget}% σ</span>
            </div>
            <input
              type="range"
              min="6"
              max="24"
              value={riskBudget}
              onChange={(e) => setRiskBudget(Number(e.target.value))}
              aria-label="Presupuesto de volatilidad anual"
              className="h-1 w-full cursor-pointer rounded-full bg-[#2C2C2E] accent-white"
            />
            <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-wider text-[#636366]">
              <span>Conservador 6%</span>
              <span>Balanceado 14%</span>
              <span>Agresivo 24%</span>
            </div>
          </div>

          <div>
            <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-[#86868B]">
              03 · Concentración de activos
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map((k) => (
                <button
                  key={k}
                  onClick={() => setTopK(k)}
                  aria-pressed={topK === k}
                  className={cn(
                    'apple-press rounded-full border py-2 font-mono text-xs transition-colors',
                    topK === k
                      ? 'border-white bg-white font-bold text-black'
                      : 'border-white/[0.08] bg-white/[0.02] text-[#86868B] hover:text-white'
                  )}
                >
                  Top-{k}
                </button>
              ))}
            </div>
          </div>

          <blockquote className="border-l-2 border-white/25 pl-4">
            <span className="flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-[#30D158]" />
              Invariante matemático respetado
            </span>
            <p className="mt-1 text-[11px] leading-relaxed text-[#86868B]">
              Ninguna posición individual puede exceder el 20.0% del portafolio. Doble blindaje de
              ejecución activo en toda simulación.
            </p>
          </blockquote>
        </div>

        {/* Live output column */}
        <div className="space-y-8 lg:col-span-7">
          {/* Real-time metrics — hairline matrix */}
          <div className="grid grid-cols-2 border-l border-t border-white/[0.07] sm:grid-cols-4">
            {[
              { label: 'Sharpe Ratio', value: <CounterNumber value={metrics.sharpe} decimals={2} />, sub: 'grado institucional', tone: 'text-white' },
              { label: 'Information Coeff.', value: <CounterNumber value={metrics.ic} decimals={3} />, sub: 'gate aprobado', tone: 'text-white' },
              { label: 'Alfa anual', value: <CounterNumber value={metrics.alpha} prefix="+" suffix="%" decimals={1} />, sub: 'vs S&P 500 (+12.4%)', tone: 'text-[#30D158]' },
              { label: 'Max Drawdown', value: <CounterNumber value={metrics.drawdown} suffix="%" decimals={1} />, sub: 'Monte Carlo', tone: 'text-[#FF453A]' },
            ].map((m) => (
              <div key={m.label} className="border-b border-r border-white/[0.07] px-4 py-4">
                <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[#636366]">
                  {m.label}
                </span>
                <span className={cn('tnum mt-1.5 block font-mono text-xl font-bold lg:text-2xl', m.tone)}>
                  {m.value}
                </span>
                <span className="mt-0.5 block font-mono text-[9px] text-[#48484A]">{m.sub}</span>
              </div>
            ))}
          </div>

          {/* Dynamic allocation bars */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#86868B]">
                Asignación dinámica del portafolio
              </span>
              <span className="font-mono text-[10px] text-[#636366]">100% ponderado · cap 20%</span>
            </div>
            <div className="space-y-3.5">
              {allocation.map((item) => (
                <div key={item.ticker}>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-white">{item.ticker}</span>
                    <span className="flex items-center gap-4 text-[10px] text-[#636366]">
                      <span>
                        score <strong className="tnum text-[#D2D2D7]">{item.score}</strong>
                      </span>
                      <span>
                        peso <strong className="tnum text-white">{item.weight}%</strong>
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.weight * 5}%` }}
                      transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#636366] via-[#D2D2D7] to-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Single CTA → pipeline */}
          <div className="flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#636366]">
              contrato JSON generado con firma SHA-256
            </span>
            <Btn onClick={() => onNavigateToTab('pipeline')}>
              <span>Ejecutar pipeline con este modelo</span>
              <ArrowRight className="h-4 w-4" />
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}
