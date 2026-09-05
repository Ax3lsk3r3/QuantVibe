import React from 'react'
import { motion } from 'framer-motion'

interface KineticTitleProps {
  text: string
  highlightWord?: string
  className?: string
}

export const KineticTitle: React.FC<KineticTitleProps> = ({
  text,
  highlightWord,
  className = '',
}) => {
  const words = text.split(' ')

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.045, // 12-principles: under 50ms stagger
        delayChildren: 0.05,
      },
    },
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 24,
      filter: 'blur(6px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        damping: 26,
        stiffness: 320,
        bounce: 0, // apple-design: critically damped default
      },
    },
  }

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      className={`editorial-display font-bold text-[#F5F5F7] tracking-[-0.038em] ${className}`}
    >
      {words.map((word, index) => {
        const isHighlight = highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase())
        return (
          <motion.span
            key={index}
            variants={child}
            className={`inline-block mr-[0.26em] last:mr-0 ${
              isHighlight
                ? 'bg-gradient-to-b from-white via-[#E1E1E6] to-[#8E8E93] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(255,255,255,0.15)] font-extrabold'
                : 'text-white'
            }`}
          >
            {word}
          </motion.span>
        )
      })}
    </motion.h1>
  )
}
