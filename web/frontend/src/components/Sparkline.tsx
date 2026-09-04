import React from 'react'

interface SparklineProps {
  data?: number[]
  positive?: boolean
  width?: number
  height?: number
  className?: string
}

export const Sparkline: React.FC<SparklineProps> = ({
  data = [45, 52, 49, 60, 58, 65, 72, 68, 78, 85],
  positive = true,
  width = 120,
  height = 36,
  className = '',
}) => {
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

  const strokeColor = positive ? '#10B981' : '#F43F5E'
  const gradientId = `sparkline-grad-${Math.random().toString(36).substring(2, 9)}`

  return (
    <div className={`inline-block overflow-hidden ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradientId})`} />
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
