import React, { useEffect, useState, useRef } from 'react'

interface CounterNumberProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  durationMs?: number
  className?: string
}

export const CounterNumber: React.FC<CounterNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  durationMs = 1200,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const startValRef = useRef<number>(0)

  useEffect(() => {
    let animationFrameId: number
    startValRef.current = displayValue
    startTimeRef.current = null

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / durationMs, 1)

      // Easing out cubic: 1 - pow(1 - progress, 3)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = startValRef.current + (value - startValRef.current) * easeOut

      setDisplayValue(current)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      } else {
        setDisplayValue(value)
      }
    }

    animationFrameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrameId)
  }, [value, durationMs])

  return (
    <span className={`tnum font-mono ${className}`}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  )
}
