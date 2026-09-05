import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Activity,
  Terminal,
  Layers,
  TrendingUp,
  Cpu,
  Monitor,
  Compass,
  X,
  ArrowUp,
  ChevronUp
} from 'lucide-react'

interface FloatingCollapsibleNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const FloatingCollapsibleNav: React.FC<FloatingCollapsibleNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
        setIsOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const tabs = [
    { id: 'landing', label: 'SaaS Showcase', sub: 'Visión General & Invariantes', icon: Sparkles },
    { id: 'overview', label: 'Alpha Studio', sub: 'Señales Activas & Gate IC', icon: Activity },
    { id: 'bloomberg', label: 'Bloomberg Terminal', sub: 'Macro Desk & News Wire en Vivo', icon: Monitor },
    { id: 'pipeline', label: 'Pipeline Control', sub: 'Consola de Minado en Vivo', icon: Terminal },
    { id: 'execution', label: 'Mesa de Órdenes', sub: 'Agente Autónomo & Invariantes', icon: Layers },
    { id: 'trackrecord', label: 'Track Record', sub: 'Equity Histórica Auditada', icon: TrendingUp },
    { id: 'architecture', label: 'Arquitectura & MCP', sub: 'Topología Dual-Brain Aislada', icon: Cpu },
  ]

  const activeItem = tabs.find((t) => t.id === activeTab) || tabs[0]
  const ActiveIcon = activeItem.icon

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId)
    setIsOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIsOpen(false)
  }

  return (
    <>
      <AnimatePresence>
        {isScrolled && (
          <div className="fixed bottom-6 right-6 sm:right-8 z-50 flex flex-col items-end">
            <AnimatePresence>
              {isOpen && (
                <>
                  <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 16 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className="relative z-50 mb-3 w-[340px] sm:w-[380px] rounded-3xl bg-[#09090D]/95 border border-white/[0.16] shadow-[0_24px_70px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-3xl p-3 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08] mb-2">
                      <div className="flex items-center space-x-2 text-xs font-mono font-medium text-[#86868B]">
                        <Compass className="w-3.5 h-3.5 text-white" />
                        <span>NAVEGACIÓN CUANTITATIVA</span>
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded-full hover:bg-white/[0.08] text-[#86868B] hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isCurrent = activeTab === tab.id

                        return (
                          <button
                            key={tab.id}
                            onClick={() => handleSelectTab(tab.id)}
                            className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between transition-all group ${
                              isCurrent
                                ? 'bg-white text-black font-semibold shadow-md'
                                : 'hover:bg-white/[0.06] text-[#D2D2D7]'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-xl transition-colors ${
                                  isCurrent
                                    ? 'bg-black text-white'
                                    : 'bg-white/[0.06] group-hover:bg-white/[0.12] text-white'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <span className={`text-xs font-medium block ${isCurrent ? 'text-black font-bold' : 'text-[#F5F5F7]'}`}>
                                  {tab.label}
                                </span>
                                <span className={`text-[10px] block ${isCurrent ? 'text-black/70' : 'text-[#86868B]'}`}>
                                  {tab.sub}
                                </span>
                              </div>
                            </div>

                            {isCurrent && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/10 text-black font-bold">
                                ACTIVO
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/[0.08]">
                      <button
                        onClick={handleScrollToTop}
                        className="w-full py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-[#86868B] hover:text-white flex items-center justify-center space-x-2 transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span>Volver al Inicio Superior</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-full border shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl transition-all ${
                isOpen
                  ? 'bg-white text-black border-white'
                  : 'bg-[#0E0E14]/90 text-white border-white/[0.18] hover:border-white/40'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>

              <div className="flex items-center space-x-2 text-xs font-medium tracking-tight">
                <ActiveIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-mono uppercase text-[11px]">{activeItem.label}</span>
              </div>

              <span className={`h-3 w-[1px] ${isOpen ? 'bg-black/20' : 'bg-white/20'}`} />

              <div className="flex items-center space-x-1 text-xs font-mono font-semibold">
                <span className="text-[11px]">{isOpen ? 'CERRAR' : 'MENÚ'}</span>
                <ChevronUp className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
