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
      className={`editorial-display font-extrabold text-slate-100 tracking-[-0.035em] ${className}`}
    >
      {words.map((word, index) => {
        const isHighlight = highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase())
        return (
          <motion.span
            key={index}
            variants={child}
            className={`inline-block mr-[0.28em] last:mr-0 ${
              isHighlight
                ? 'gradient-text-cyan drop-shadow-[0_0_24px_rgba(0,242,254,0.35)]'
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
