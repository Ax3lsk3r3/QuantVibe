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

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] flex flex-col selection:bg-white/20 selection:text-white relative overflow-x-hidden font-sans">
      {/* Apple Pro Subtle Atmospheric Rim Light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full bg-white/[0.025] blur-[160px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-white/[0.015] blur-[180px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-white/[0.01] blur-[200px]" />
      </div>

      {/* Frosted Apple Navigation Header */}
      <Header
        status={status}
        evaluation={evaluation}
        signals={signals}
        loading={loading}
        onRefresh={loadData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* TradingView Live Streaming Ticker Tape Carousel */}
      <TradingViewTickerTape />

      {/* Main Workspace Container with Animated Tab Transition */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          >
            {activeTab === 'landing' && (
              <LandingPage onNavigateToTab={setActiveTab} />
            )}

            {activeTab === 'overview' && (
              <OverviewTab
                signals={signals}
                evaluation={evaluation}
                orders={orders}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'bloomberg' && <BloombergTerminal />}

            {activeTab === 'pipeline' && (
              <PipelineTab status={status} onPipelineFinished={loadData} />
            )}

            {activeTab === 'execution' && (
              <ExecutionTab orders={orders} onRefresh={loadData} />
            )}

            {activeTab === 'trackrecord' && (
              <TrackRecordTab trackRecord={trackRecord} />
            )}

            {activeTab === 'architecture' && <ArchitectureTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Collapsible Navigation Dock (Follows scroll & collapses into button) */}
      <FloatingCollapsibleNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Translucent Apple Glass Footer */}
      <footer className="border-t border-white/[0.08] bg-[#000000]/80 backdrop-blur-2xl py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#86868B] relative z-10">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[#F5F5F7] font-medium tracking-tight">QuantVibe Live Production Terminal</span>
            <span className="text-white/20">•</span>
            <span className="text-[#86868B]">Engineered for Precision & Zero-Latency</span>
          </div>

          <div className="text-center sm:text-right text-[#86868B] text-[11px] tracking-tight">
            Microsoft Qlib Intelligence × Vibe-Trading Autonomous Agent • SHA-256 Tamper-Proof Vault
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
