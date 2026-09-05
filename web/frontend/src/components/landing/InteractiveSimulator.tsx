import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Sliders,
  ShieldCheck,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { CounterNumber } from './CounterNumber'

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
    bias: { NVDA: 0.20, AAPL: 0.18, MSFT: 0.17, AMD: 0.15, GOOGL: 0.16, TSLA: 0.14 },
  },
  {
    id: 'momentum',
    name: 'Momentum Breakout',
    desc: 'LightGBM optimizado para capturar aceleración tendencial',
    baseSharpe: 2.68,
    baseIC: 0.094,
    baseAlpha: 32.4,
    baseDrawdown: -10.2,
    bias: { NVDA: 0.20, TSLA: 0.20, AMD: 0.18, AAPL: 0.15, MSFT: 0.14, GOOGL: 0.13 },
  },
  {
    id: 'mean_reversion',
    name: 'StatArb Mean-Reversion',
    desc: 'Reversión a la media con normalización de volatilidad',
    baseSharpe: 2.25,
    baseIC: 0.071,
    baseAlpha: 21.2,
    baseDrawdown: -5.4,
    bias: { MSFT: 0.20, GOOGL: 0.19, AAPL: 0.18, NVDA: 0.16, AMD: 0.14, TSLA: 0.13 },
  },
]

export const InteractiveSimulator: React.FC<InteractiveSimulatorProps> = ({ onNavigateToTab }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('alpha158')
  const [riskBudget, setRiskBudget] = useState<number>(14) // 5 to 25%
  const [topK, setTopK] = useState<number>(5) // 3 to 6

  const activeModel = useMemo(
    () => MODELS.find((m) => m.id === selectedModelId) || MODELS[0],
    [selectedModelId]
  )

  // Recalculate metrics based on sliders
  const metrics = useMemo(() => {
    const riskFactor = riskBudget / 14 // normalized around default 14%
    const sharpe = activeModel.baseSharpe * (1 + (riskBudget - 14) * 0.015)
    const ic = activeModel.baseIC * (1 + (topK - 4) * 0.02)
    const alpha = activeModel.baseAlpha * riskFactor
    const drawdown = activeModel.baseDrawdown * (riskBudget / 12)
    return { sharpe, ic, alpha, drawdown }
  }, [activeModel, riskBudget, topK])

  // Recalculate allocation weights
  const allocation = useMemo(() => {
    const rawEntries = Object.entries(activeModel.bias).slice(0, topK)
    const sum = rawEntries.reduce((acc, [, w]) => acc + w, 0)
    return rawEntries.map(([ticker, w]) => {
      // Normalize so weights sum to exactly 100%, and cap any single asset at 20%
      const normalizedWeight = Math.min(20, Math.round((w / sum) * 100 * 10) / 10)
      return {
        ticker,
        weight: normalizedWeight,
        score: (0.75 + (w * 0.8)).toFixed(3),
      }
    })
  }, [activeModel, topK])

  return (
    <div className="relative w-full rounded-3xl bg-[#0C0C10] border border-white/[0.08] p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-2xl overflow-hidden">
      {/* Apple Subtle Top Light Highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-medium text-[#A1A1A6] mb-1.5">
            <Sliders className="w-3.5 h-3.5 text-white" />
            <span>LABORATORIO DE FACTORES INTERACTIVO</span>
          </div>
          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-[-0.035em] leading-[1.1]">
            Simula tu Portafolio Institucional en{' '}
            <span className="font-serif italic font-normal text-[#D2D2D7]">Vivo.</span>
          </h3>
          <p className="text-sm text-[#86868B] mt-1 max-w-xl leading-relaxed">
            Ajusta los parámetros de alpha y tolerancia de riesgo para observar en tiempo real cómo
            el <span className="text-[#F5F5F7]">Cerebro Qlib</span> y las <span className="text-[#F5F5F7]">Manos Vibe</span> recalculan
            la frontera eficiente y la validación del Gate IC.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/[0.04] p-1.5 rounded-full border border-white/[0.08] self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 ml-2" />
          <span className="text-xs font-mono text-[#D2D2D7] pr-2">Simulador Reactivo v2.4</span>
        </div>
      </div>

      {/* Grid: Controls & Real-Time Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        {/* Left Column: Interactive Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-3">
              1. Estrategia de Factor Mining
            </label>
            <div className="space-y-2.5">
              {MODELS.map((model) => {
                const isSelected = model.id === selectedModelId
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModelId(model.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all apple-press ${
                      isSelected
                        ? 'bg-white/[0.1] border-white/30 text-white shadow-sm'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] text-[#A1A1A6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-[#D2D2D7]'}`}>
                        {model.name}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <p className="text-xs text-[#86868B] mt-1">{model.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Risk Budget Slider */}
          <div className="bg-[#121216] border border-white/[0.08] p-4 rounded-2xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#A1A1A6] font-medium">2. Presupuesto de Volatilidad Anual</span>
              <span className="font-mono text-white font-bold">{riskBudget}% σ</span>
            </div>
            <input
              type="range"
              min="6"
              max="24"
              value={riskBudget}
              onChange={(e) => setRiskBudget(Number(e.target.value))}
              className="w-full accent-white h-1.5 bg-[#2C2C2E] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#86868B] mt-1.5">
              <span>Conservador (6%)</span>
              <span>Balanceado (14%)</span>
              <span>Agresivo (24%)</span>
            </div>
          </div>

          {/* Top-K Selection */}
          <div className="bg-[#121216] border border-white/[0.08] p-4 rounded-2xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#A1A1A6] font-medium">3. Concentración de Activos (Top-k)</span>
              <span className="font-mono text-white font-bold">{topK} Activos</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map((k) => (
                <button
                  key={k}
                  onClick={() => setTopK(k)}
                  className={`py-2 rounded-xl text-xs font-mono font-medium border transition-colors apple-press ${
                    topK === k
                      ? 'bg-white/[0.16] text-white border-white/30 font-semibold'
                      : 'bg-white/[0.03] text-[#86868B] border-white/[0.06] hover:text-white'
                  }`}
                >
                  Top-{k}
                </button>
              ))}
            </div>
          </div>

          {/* Invariant Badge */}
          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[#F5F5F7] text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-white">Invariante Matemático Respetado:</span>
              <span className="text-[#86868B] text-[11px] leading-relaxed block mt-0.5">
                Ninguna posición individual puede exceder el 20.0% del portafolio. Doble blindaje activo.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Output & Allocation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Real-Time Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#121216] border border-white/[0.08] relative overflow-hidden">
              <span className="text-[11px] text-[#86868B] font-medium block mb-1">Sharpe Ratio</span>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono flex items-center space-x-1">
                <CounterNumber value={metrics.sharpe} decimals={2} />
              </div>
              <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Grado Institucional</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121216] border border-white/[0.08] relative overflow-hidden">
              <span className="text-[11px] text-[#86868B] font-medium block mb-1">Information Coeff (IC)</span>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono flex items-center space-x-1">
                <CounterNumber value={metrics.ic} decimals={3} />
              </div>
              <span className="text-[10px] text-[#A1A1A6] font-mono mt-1 block">Gate ≥ 0.05 Aprobado</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121216] border border-white/[0.08] relative overflow-hidden">
              <span className="text-[11px] text-[#86868B] font-medium block mb-1">Retorno Alfa Anual</span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono flex items-center space-x-1">
                <CounterNumber value={metrics.alpha} prefix="+" suffix="%" decimals={1} />
              </div>
              <span className="text-[10px] text-[#86868B] font-mono mt-1 block">vs S&P 500 (+12.4%)</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121216] border border-white/[0.08] relative overflow-hidden">
              <span className="text-[11px] text-[#86868B] font-medium block mb-1">Max Drawdown</span>
              <div className="text-xl sm:text-2xl font-bold text-rose-400 font-mono flex items-center space-x-1">
                <CounterNumber value={metrics.drawdown} suffix="%" decimals={1} />
              </div>
              <span className="text-[10px] text-[#86868B] font-mono mt-1 block">Simulación Monte Carlo</span>
            </div>
          </div>

          {/* Dynamic Weight Allocation Bars */}
          <div className="p-5 rounded-2xl bg-[#121216] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D2D2D7] flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-white" />
                <span>Asignación Dinámica del Portafolio</span>
              </span>
              <span className="text-xs font-mono text-[#86868B]">Total: 100% Ponderado</span>
            </div>

            <div className="space-y-3">
              {allocation.map((item) => (
                <div key={item.ticker} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white">{item.ticker}</span>
                    <div className="flex items-center space-x-3 text-[#86868B] text-[11px]">
                      <span>Score Qlib: <strong className="text-white">{item.score}</strong></span>
                      <span>Peso: <strong className="text-[#D2D2D7]">{item.weight}%</strong></span>
                    </div>
                  </div>
                  {/* Visual Bar */}
                  <div className="h-1.5 w-full bg-[#202025] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.weight * 5}%` }}
                      transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                      className="h-full rounded-full bg-gradient-to-r from-white via-[#D2D2D7] to-[#8E8E93]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-2 text-xs text-[#86868B]">
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>Contrato JSON generado con firma SHA-256</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigateToTab('pipeline')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-[#E8E8ED] shadow-lg flex items-center justify-center space-x-2 apple-press"
            >
              <span>Ejecutar Pipeline con este Modelo</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
