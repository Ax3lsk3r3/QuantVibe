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
    <div className={`inline-flex items-center space-x-2.5 overflow-hidden py-1 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,242,254,0.8)]" />
      <div className="relative h-7 flex items-center min-w-[280px] sm:min-w-[380px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              bounce: 0,
            }}
            className="absolute left-0 text-xs sm:text-sm font-mono font-medium text-cyan-300/90 tracking-wide flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 opacity-80" />
            <span>{phrases[index]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
