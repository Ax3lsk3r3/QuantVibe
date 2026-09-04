import React, { useState, useEffect, useCallback } from 'react'
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
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        status={status}
        evaluation={evaluation}
        signals={signals}
        loading={loading}
        onRefresh={loadData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 bg-dark-900/60 py-4 px-4 sm:px-6 lg:px-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>QuantVibe Web Gateway</span>
            <span>•</span>
            <span>Codespaces & Web Ready</span>
          </div>
          <div>
            Puente Cuantitativo Qlib & Vibe-Trading | Contrato firmado SHA-256
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
