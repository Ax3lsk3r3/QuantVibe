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
      y: 30,
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
      className={`font-sans font-extrabold tracking-[-0.04em] text-white ${className}`}
    >
      {words.map((word, index) => {
        const isHighlight = highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase())
        const isItalic = italicWord && word.toLowerCase().includes(italicWord.toLowerCase())

        return (
          <motion.span
            key={index}
            variants={child}
            className={`mr-[0.22em] inline-block last:mr-0 ${
              isItalic
                ? 'italic text-[#86868B]'
                : isHighlight
                ? 'titanium-text-gradient'
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
