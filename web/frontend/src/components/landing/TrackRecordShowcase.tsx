import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Calendar, Database } from 'lucide-react'

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

  // SVG dimensions
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

  // Build SVG paths
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
    <div className="w-full py-12">
      <div className="rounded-3xl bg-[#0C0C10] border border-white/[0.08] p-6 sm:p-8 lg:p-10 backdrop-blur-2xl relative overflow-hidden">
        {/* Subtle top light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.12] text-[#A1A1A6] text-xs font-mono mb-2">
              <Award className="w-3.5 h-3.5 text-white" />
              <span>DESEMPEÑO HISTÓRICO AUDITADO</span>
            </div>
            <h3 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-[-0.035em] leading-[1.1]">
              Curva de Equity vs <span className="text-[#86868B]">Benchmark S&P 500</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#86868B] mt-1">
              Backtest continuo rolling walk-forward (Alpha158 + LightGBM con costos de transacción 5bps).
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span className="text-white font-medium">QuantVibe Alpha (+36.2%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#48484A]" />
              <span className="text-[#86868B]">S&P 500 (+13.8%)</span>
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative w-full overflow-hidden bg-[#070709] rounded-2xl border border-white/[0.06] p-4">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-48 sm:h-64 overflow-visible cursor-crosshair"
          >
            <defs>
              <linearGradient id="landingAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
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
                  <text
                    x={paddingX - 10}
                    y={y + 3}
                    textAnchor="end"
                    fill="#636366"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {level}
                  </text>
                </g>
              )
            })}

            {/* Benchmark Area / Line */}
            <path
              d={benchmarkPath}
              fill="none"
              stroke="#48484A"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Strategy Area & Line */}
            <path d={strategyArea} fill="url(#landingAreaGrad)" />
            <path
              d={strategyPath}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Interactive Data Nodes */}
            {HISTORICAL_DATA.map((pt, i) => {
              const cx = getX(i)
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
                    fill={isHovered ? '#FFFFFF' : '#141418'}
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

          {/* Floating Tooltip */}
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 bg-[#141418]/95 border border-white/20 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl text-xs font-mono space-y-1.5 z-20"
            >
              <div className="flex items-center space-x-2 text-white font-bold pb-1.5 border-b border-white/[0.08]">
                <Calendar className="w-3.5 h-3.5 text-[#A1A1A6]" />
                <span>Mes: {hoveredPoint.month}</span>
              </div>
              <div className="text-white">
                QuantVibe: <strong>{hoveredPoint.strategy.toFixed(1)}</strong> (+{(hoveredPoint.strategy - 100).toFixed(1)}%)
              </div>
              <div className="text-[#86868B]">
                S&P 500: {hoveredPoint.benchmark.toFixed(1)} (+{(hoveredPoint.benchmark - 100).toFixed(1)}%)
              </div>
              <div className="text-emerald-400 text-[10px] font-semibold pt-0.5">
                Alpha Spread: +{(hoveredPoint.strategy - hoveredPoint.benchmark).toFixed(1)}%
              </div>
            </motion.div>
          )}
        </div>

        {/* Audited Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/[0.06]">
          <div className="p-3.5 rounded-2xl bg-[#121216] border border-white/[0.08]">
            <span className="text-[11px] text-[#86868B] block mb-1">Alpha Anualizado</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">+28.4%</span>
            <span className="text-[9px] text-[#86868B] block mt-0.5">vs +11.2% benchmark</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121216] border border-white/[0.08]">
            <span className="text-[11px] text-[#86868B] block mb-1">Sharpe Ratio</span>
            <span className="text-lg font-bold text-white font-mono">2.41</span>
            <span className="text-[9px] text-emerald-400 block mt-0.5">Excelente (&gt; 2.0)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121216] border border-white/[0.08]">
            <span className="text-[11px] text-[#86868B] block mb-1">Max Drawdown</span>
            <span className="text-lg font-bold text-rose-400 font-mono">-8.2%</span>
            <span className="text-[9px] text-[#86868B] block mt-0.5">S&P 500: -19.4%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121216] border border-white/[0.08]">
            <span className="text-[11px] text-[#86868B] block mb-1">Win Rate</span>
            <span className="text-lg font-bold text-white font-mono">64.2%</span>
            <span className="text-[9px] text-[#86868B] block mt-0.5">Operaciones liquidadas</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121216] border border-white/[0.08]">
            <span className="text-[11px] text-[#86868B] block mb-1">Profit Factor</span>
            <span className="text-lg font-bold text-white font-mono">2.18</span>
            <span className="text-[9px] text-[#86868B] block mt-0.5">Gross Profit / Loss</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121216] border border-white/[0.08]">
            <span className="text-[11px] text-[#86868B] block mb-1">Auditoría SQLite</span>
            <span className="text-lg font-bold text-emerald-400 font-mono flex items-center space-x-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>100%</span>
            </span>
            <span className="text-[9px] text-[#86868B] block mt-0.5">Ledger inmutable</span>
          </div>
        </div>
      </div>
    </div>
  )
}
