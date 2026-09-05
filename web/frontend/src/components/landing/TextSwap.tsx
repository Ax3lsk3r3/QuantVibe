import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

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
    <div className={`inline-flex items-center space-x-2.5 px-3.5 py-1 rounded-full bg-[#141418] border border-white/[0.1] shadow-sm overflow-hidden ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
      <div className="relative h-6 flex items-center min-w-[280px] sm:min-w-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(3px)' }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 320,
              bounce: 0,
            }}
            className="absolute left-0 text-xs sm:text-[13px] font-medium text-[#D2D2D7] tracking-tight flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A1A1A6]" />
            <span>{phrases[index]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
