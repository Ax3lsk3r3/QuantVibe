import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './components/Header'
import { OverviewTab } from './components/OverviewTab'
import { PipelineTab } from './components/PipelineTab'
import { ExecutionTab } from './components/ExecutionTab'
import { TrackRecordTab } from './components/TrackRecordTab'
import { ArchitectureTab } from './components/ArchitectureTab'
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
  const [activeTab, setActiveTab] = useState<string>('overview')
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
    <div className="min-h-screen bg-[#05070B] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden font-sans">
      {/* Dynamic Ambient Background Glow Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[140px] animate-float-slow" />
        <div className="absolute top-[35%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[150px] animate-float-delayed" />
        <div className="absolute bottom-[-10%] left-[30%] w-[550px] h-[550px] rounded-full bg-blue-600/10 blur-[160px]" />
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

      {/* Main Workspace Container with Animated Tab Transition */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab
                signals={signals}
                evaluation={evaluation}
                orders={orders}
                onNavigateToTab={setActiveTab}
              />
            )}

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

      {/* Translucent Glass Footer */}
      <footer className="border-t border-white/[0.06] bg-[#05070B]/80 backdrop-blur-xl py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">QuantVibe Live Gateway</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">GitHub Codespaces & Web Ready</span>
          </div>

          <div className="text-center sm:text-right text-slate-400 text-[11px]">
            Qlib Quant Brain × Vibe-Trading LLM Hands • Contrato Criptográfico Inmutable
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
