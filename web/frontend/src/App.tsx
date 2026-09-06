import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './components/Header'
import { OverviewTab } from './components/OverviewTab'
import { PipelineTab } from './components/PipelineTab'
import { ExecutionTab } from './components/ExecutionTab'
import { TrackRecordTab } from './components/TrackRecordTab'
import { ArchitectureTab } from './components/ArchitectureTab'
import { LandingPage } from './components/LandingPage'
import { TradingViewTickerTape } from './components/TradingViewTickerTape'
import { BloombergTerminal } from './components/BloombergTerminal'
import { FloatingCollapsibleNav } from './components/FloatingCollapsibleNav'
import {
  fetchStatus,
  fetchSignals,
  fetchEvaluation,
  fetchOrders,
  fetchTrackRecord,
} from './api'
import type {
  SystemStatus,
  SignalsResponse,
  EvaluationData,
  OrdersPlan,
  TrackRecordResponse,
} from './types'
import { StatusDot } from './components/ui'

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing')
  const [loading, setLoading] = useState<boolean>(true)

  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [signals, setSignals] = useState<SignalsResponse | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null)
  const [orders, setOrders] = useState<OrdersPlan | null>(null)
  const [trackRecord, setTrackRecord] = useState<TrackRecordResponse | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const results = await Promise.allSettled([
      fetchStatus(),
      fetchSignals(),
      fetchEvaluation(),
      fetchOrders(),
      fetchTrackRecord(),
    ])

    if (results[0].status === 'fulfilled') setStatus(results[0].value)
    if (results[1].status === 'fulfilled') setSignals(results[1].value)
    if (results[2].status === 'fulfilled') setEvaluation(results[2].value)
    if (results[3].status === 'fulfilled') setOrders(results[3].value)
    if (results[4].status === 'fulfilled') setTrackRecord(results[4].value)

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const navigate = useCallback((tab: string) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#000000] font-sans text-[#F5F5F7] selection:bg-white/20 selection:text-white">
      {/* Ambient aurora depth layer (monochrome, fixed) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-[-18%] h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-[160px]" />
        <div className="absolute right-[-12%] top-[38%] h-[650px] w-[650px] rounded-full bg-white/[0.018] blur-[180px]" />
        <div className="absolute bottom-[-15%] left-[-8%] h-[600px] w-[600px] rounded-full bg-white/[0.012] blur-[200px]" />
      </div>

      {/* Single source of navigation: frosted sticky header */}
      <Header
        status={status}
        evaluation={evaluation}
        loading={loading}
        onRefresh={loadData}
        activeTab={activeTab}
        setActiveTab={navigate}
      />

      {/* Live market tape — real streaming data */}
      <TradingViewTickerTape />

      <main className="relative z-10 mx-auto w-full max-w-[1720px] flex-1 px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          >
            {activeTab === 'landing' && (
              <LandingPage
                onNavigateToTab={navigate}
                signals={signals}
                evaluation={evaluation}
              />
            )}

            {activeTab === 'overview' && (
              <OverviewTab
                signals={signals}
                evaluation={evaluation}
                orders={orders}
                onNavigateToTab={navigate}
              />
            )}

            {activeTab === 'bloomberg' && <BloombergTerminal />}

            {activeTab === 'pipeline' && (
              <PipelineTab status={status} onPipelineFinished={loadData} />
            )}

            {activeTab === 'execution' && (
              <ExecutionTab orders={orders} onRefresh={loadData} />
            )}

            {activeTab === 'trackrecord' && <TrackRecordTab trackRecord={trackRecord} />}

            {activeTab === 'architecture' && <ArchitectureTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating collapsible scroll navigation */}
      <FloatingCollapsibleNav activeTab={activeTab} setActiveTab={navigate} />

      {/* Editorial hairline footer */}
      <footer className="relative z-10 border-t border-white/[0.07] bg-black/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1720px] flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8 xl:px-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="font-sans text-xl font-bold tracking-tight text-white">
                Quant<span className="text-[#86868B]">Vibe</span>
              </span>
              <StatusDot tone="pos" ping={!loading} />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#636366]">
              Terminal de producción en vivo · v1.0.1
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-[#86868B]" aria-label="Accesos rápidos">
            {[
              { id: 'overview', label: 'Alpha Studio' },
              { id: 'bloomberg', label: 'Terminal Bloomberg' },
              { id: 'pipeline', label: 'Pipeline' },
              { id: 'execution', label: 'Mesa de Órdenes' },
              { id: 'trackrecord', label: 'Track Record' },
              { id: 'architecture', label: 'Arquitectura' },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => navigate(l.id)}
                className="transition-colors hover:text-white"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="space-y-1 text-right font-mono text-[10px] leading-relaxed text-[#48484A]">
            <p>Qlib ML Brain × Vibe-Trading Agent · Bóveda SHA-256</p>
            <p>Alibaba Cloud ECS · FastAPI · Despliegue continuo</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
