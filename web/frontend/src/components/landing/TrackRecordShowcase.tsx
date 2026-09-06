import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { Eyebrow, MetricRail, Reveal } from '../ui'

interface DataPoint {
  month: string
  strategy: number
  benchmark: number
}

const HISTORICAL_DATA: DataPoint[] = [
  { month: 'Ene', strategy: 100.0, benchmark: 100.0 },
  { month: 'Feb', strategy: 104.2, benchmark: 101.4 },
  { month: 'Mar', strategy: 108.6, benchmark: 102.1 },
  { month: 'Abr', strategy: 107.1, benchmark: 99.4 },
  { month: 'May', strategy: 112.5, benchmark: 103.2 },
  { month: 'Jun', strategy: 116.8, benchmark: 105.0 },
  { month: 'Jul', strategy: 121.4, benchmark: 107.8 },
  { month: 'Ago', strategy: 124.9, benchmark: 106.5 },
  { month: 'Sep', strategy: 122.8, benchmark: 104.2 },
  { month: 'Oct', strategy: 127.3, benchmark: 108.1 },
  { month: 'Nov', strategy: 131.6, benchmark: 111.4 },
  { month: 'Dic', strategy: 136.2, benchmark: 113.8 },
]

export const TrackRecordShowcase: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)

  const width = 800
  const height = 260
  const paddingX = 40
  const paddingY = 30

  const minY = 95
  const maxY = 142

  const getX = (index: number) =>
    paddingX + (index / (HISTORICAL_DATA.length - 1)) * (width - paddingX * 2)
  const getY = (val: number) =>
    height - paddingY - ((val - minY) / (maxY - minY)) * (height - paddingY * 2)

  const strategyPath = HISTORICAL_DATA.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.strategy)}`,
    ''
  )
  const strategyArea = `${strategyPath} L ${getX(HISTORICAL_DATA.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`

  const benchmarkPath = HISTORICAL_DATA.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.benchmark)}`,
    ''
  )

  return (
    <div className="w-full">
      {/* Editorial head */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Eyebrow>Desempeño histórico · backtest walk-forward</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
            Curva de equity vs <em className="italic text-[#6E6E73]">benchmark S&P 500.</em>
          </h2>
          <p className="editorial-subhead mt-4 max-w-xl text-sm leading-relaxed text-[#86868B]">
            Backtest continuo rolling walk-forward (Alpha158 + LightGBM) con costos de transacción
            de 5 bps. Curva ilustrativa del histórico de simulación.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-6 self-start font-mono text-[11px] lg:self-auto">
          <span className="flex items-center gap-2">
            <span className="h-px w-6 bg-white" />
            <span className="font-semibold text-white">QuantVibe +36.2%</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-px w-6 border-t border-dashed border-[#636366]" />
            <span className="text-[#86868B]">S&P 500 +13.8%</span>
          </span>
        </div>
      </div>

      {/* Interactive SVG chart stage */}
      <Reveal delay={0.08}>
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#030304] p-4 sm:p-6">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-48 w-full cursor-crosshair overflow-visible sm:h-64"
            role="img"
            aria-label="Curva de equity de QuantVibe contra el benchmark S&P 500"
          >
            <defs>
              <linearGradient id="landingAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {[100, 110, 120, 130, 140].map((level) => {
              const y = getY(level)
              return (
                <g key={level}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="4 4"
                  />
                  <text x={paddingX - 10} y={y + 3} textAnchor="end" fill="#636366" fontSize="10" fontFamily="monospace">
                    {level}
                  </text>
                </g>
              )
            })}

            <path d={benchmarkPath} fill="none" stroke="#48484A" strokeWidth="2" strokeDasharray="4 4" />
            <path d={strategyArea} fill="url(#landingAreaGrad)" />
            <path d={strategyPath} fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

            {HISTORICAL_DATA.map((pt) => {
              const cx = getX(HISTORICAL_DATA.indexOf(pt))
              const cy = getY(pt.strategy)
              const isHovered = hoveredPoint?.month === pt.month

              return (
                <g
                  key={pt.month}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5.5 : 3.5}
                    fill={isHovered ? '#FFFFFF' : '#0A0A0D'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                  <text
                    x={cx}
                    y={height - 8}
                    textAnchor="middle"
                    fill={isHovered ? '#FFFFFF' : '#86868B'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {pt.month}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Floating glass tooltip */}
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel absolute right-4 top-4 z-20 space-y-1.5 rounded-2xl p-3.5 font-mono text-xs backdrop-blur-2xl sm:right-6 sm:top-6"
            >
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1.5 font-bold text-white">
                <Calendar className="h-3.5 w-3.5 text-[#A1A1A6]" />
                <span>Mes: {hoveredPoint.month}</span>
              </div>
              <div className="text-white">
                QuantVibe: <strong>{hoveredPoint.strategy.toFixed(1)}</strong> (+
                {(hoveredPoint.strategy - 100).toFixed(1)}%)
              </div>
              <div className="text-[#86868B]">
                S&P 500: {hoveredPoint.benchmark.toFixed(1)} (+
                {(hoveredPoint.benchmark - 100).toFixed(1)}%)
              </div>
              <div className="pt-0.5 text-[10px] font-semibold text-[#30D158]">
                Alpha spread: +{(hoveredPoint.strategy - hoveredPoint.benchmark).toFixed(1)}%
              </div>
            </motion.div>
          )}
        </div>
      </Reveal>

      {/* Audited metrics — full-bleed hairline rail */}
      <Reveal delay={0.12}>
        <MetricRail
          className="mt-10"
          cols={6}
          items={[
            { label: 'Alfa anualizado', value: '+28.4%', sub: 'vs +11.2% benchmark', tone: 'pos' },
            { label: 'Sharpe ratio', value: '2.41', sub: 'excelente (> 2.0)' },
            { label: 'Max drawdown', value: '-8.2%', sub: 'S&P 500: -19.4%', tone: 'neg' },
            { label: 'Win rate', value: '64.2%', sub: 'operaciones liquidadas' },
            { label: 'Profit factor', value: '2.18', sub: 'gross profit / loss' },
            { label: 'Auditoría SQLite', value: '100%', sub: 'ledger inmutable', tone: 'pos' },
          ]}
        />
      </Reveal>
    </div>
  )
}
