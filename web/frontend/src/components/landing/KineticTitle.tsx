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
        staggerChildren: 0.04,
        delayChildren: 0.04,
      },
    },
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 28,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        damping: 28,
        stiffness: 300,
        bounce: 0,
      },
    },
  }

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      className={`font-sans font-bold text-[#FFFFFF] tracking-[-0.045em] ${className}`}
    >
      {words.map((word, index) => {
        const isHighlight = highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase())
        const isItalic = italicWord && word.toLowerCase().includes(italicWord.toLowerCase())

        return (
          <motion.span
            key={index}
            variants={child}
            className={`inline-block mr-[0.24em] last:mr-0 ${
              isItalic
                ? 'text-[#86868B] font-extrabold tracking-[-0.03em]'
                : isHighlight
                ? 'bg-gradient-to-b from-white via-[#E1E1E6] to-[#71717A] bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(255,255,255,0.18)] font-extrabold'
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
