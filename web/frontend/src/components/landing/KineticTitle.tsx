import React from 'react'
import { motion } from 'framer-motion'

interface KineticTitleProps {
  text: string
  highlightWord?: string
  italicWord?: string
  className?: string
}

export const KineticTitle: React.FC<KineticTitleProps> = ({
  text,
  highlightWord,
  italicWord,
  className = '',
}) => {
  const words = text.split(' ')

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.045,
        delayChildren: 0.05,
      },
    },
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 28,
      filter: 'blur(12px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        damping: 26,
        stiffness: 280,
        bounce: 0,
      },
    },
  }

  return (
    <div className="relative inline-block w-full">
      {/* Diffused atmospheric metallic aura behind headline */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[160px] w-full max-w-4xl rounded-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent blur-[80px]"
        aria-hidden
      />

      <motion.h1
        variants={container}
        initial="hidden"
        animate="visible"
        className={`relative z-10 font-sans font-black tracking-[-0.045em] select-none ${className}`}
      >
        {words.map((word, index) => {
          const isHighlight =
            highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase())
          const isItalic =
            italicWord && word.toLowerCase().includes(italicWord.toLowerCase())

          return (
            <motion.span
              key={index}
              variants={child}
              className={`inline-block py-1 pr-[0.24em] last:pr-0 overflow-visible ${
                isHighlight
                  ? 'metallic-text-bright'
                  : isItalic
                  ? 'metallic-text-smoked'
                  : 'metallic-text-lead'
              }`}
            >
              {word}
            </motion.span>
          )
        })}
      </motion.h1>
    </div>
  )
}
