import React, { useId } from 'react'

interface SparklineProps {
  data?: number[]
  positive?: boolean
  width?: number
  height?: number
  className?: string
  strokeColor?: string
}

export const Sparkline: React.FC<SparklineProps> = ({
  data = [45, 52, 49, 60, 58, 65, 72, 68, 78, 85],
  positive,
  width = 120,
  height = 36,
  className = '',
  strokeColor,
}) => {
  const gradientId = useId()

  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width
    const y = height - ((val - min) / range) * (height - 8) - 4
    return { x, y }
  })

  const pathD = points.reduce(
    (acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
    ''
  )

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`

  /* Monochrome platinum by default; semantic green/red only when P&L context is explicit */
  const resolvedStroke =
    strokeColor || (positive === undefined ? '#A1A1A6' : positive ? '#30D158' : '#FF453A')

  return (
    <div className={`inline-block overflow-hidden ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={resolvedStroke} stopOpacity="0.16" />
            <stop offset="100%" stopColor={resolvedStroke} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradientId})`} />
        <path
          d={pathD}
          fill="none"
          stroke={resolvedStroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
