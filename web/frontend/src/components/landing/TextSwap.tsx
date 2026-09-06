import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TextSwapProps {
  phrases: string[]
  intervalMs?: number
  className?: string
}

export const TextSwap: React.FC<TextSwapProps> = ({
  phrases,
  intervalMs = 3800,
  className = '',
}) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (phrases.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [phrases.length, intervalMs])

  return (
    <div
      className={`inline-flex max-w-full items-center gap-2.5 overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-1.5 backdrop-blur-xl ${className}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-white/70" />
      <div className="relative flex h-5 min-w-[260px] items-center sm:min-w-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(3px)' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320, bounce: 0 }}
            className="absolute left-0 flex items-center font-mono text-[11px] tracking-tight text-[#A1A1A6]"
          >
            <span className="truncate">{phrases[index]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
