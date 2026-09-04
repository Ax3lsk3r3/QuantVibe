import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  Play,
  Terminal as TermIcon,
  Copy,
  Trash2,
  Loader2,
  Sliders,
  Sparkles,
  Search,
  Check,
  Zap,
} from 'lucide-react'
import { runPipeline } from '../api'
import type { SystemStatus } from '../types'

interface PipelineTabProps {
  status: SystemStatus | null
  onPipelineFinished: () => void
}

const ALL_STEPS = [
  { id: 'prepare', label: '1. Ingesta (prepare)', desc: 'Descarga y preprocesamiento de datos' },
  { id: 'settle', label: '2. Liquidación (settle)', desc: 'Auditoría en SQLite de retornos pasados' },
  { id: 'train', label: '3. Entrenamiento (train)', desc: 'Modelo LightGBM sobre Alpha158' },
  { id: 'export', label: '4. Evaluación (export)', desc: 'Control de Gate IC/ICIR y firma SHA-256' },
  { id: 'execute', label: '5. Plan (execute)', desc: 'Construcción del plan de órdenes equal-weight' },
]

export const PipelineTab: React.FC<PipelineTabProps> = ({
  status,
  onPipelineFinished,
}) => {
  const [mode, setMode] = useState<'demo' | 'real'>('demo')
  const [selectedSteps, setSelectedSteps] = useState<string[]>(ALL_STEPS.map((s) => s.id))
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [copied, setCopied] = useState(false)
  const [searchLog, setSearchLog] = useState('')
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (status?.pipeline.is_running !== undefined) {
      setIsRunning(status.pipeline.is_running)
    }
  }, [status])

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const API_BASE = import.meta.env.VITE_API_BASE || '/api'
    const es = new EventSource(`${API_BASE}/pipeline/logs/stream`)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.line) {
          setLogs((prev) => [...prev, data.line])
        }
        if (data.done) {
          setIsRunning(false)
          onPipelineFinished()
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#00F2FE', '#4FACFE', '#8B5CF6', '#10B981'],
          })
          es.close()
        }
      } catch (err) {
        console.error('Error parsing SSE:', err)
      }
    }

    es.onerror = () => {
      es.close()
    }
  }

  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || '/api'
        const res = await fetch(`${API_BASE}/pipeline/logs`)
        if (res.ok) {
          const data = await res.json()
          if (data.logs && data.logs.length > 0) {
            setLogs(data.logs)
          }
          if (data.is_running) {
            setIsRunning(true)
            connectSSE()
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchInitialLogs()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const handleToggleStep = (stepId: string) => {
    setSelectedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((s) => s !== stepId) : [...prev, stepId]
    )
  }

  const handleRunPipeline = async () => {
    if (selectedSteps.length === 0) {
      alert('Por favor selecciona al menos una fase del pipeline.')
      return
    }

    setIsRunning(true)
    setLogs((prev) => [
      ...prev,
      `\n-----------------------------------------------------------`,
      `[CLIENTE] Invocando pipeline en modo: ${mode.toUpperCase()}...`,
    ])

    try {
      await runPipeline(mode, selectedSteps)
      connectSSE()
    } catch (err: any) {
      setLogs((prev) => [...prev, `[ERROR AL INICIAR] ${err.message}`])
      setIsRunning(false)
    }
  }

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  const filteredLogs = searchLog
    ? logs.filter((line) => line.toLowerCase().includes(searchLog.toLowerCase()))
    : logs

  return (
    <div className="space-y-8 font-sans">
      {/* Configuration Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Centro de Mando del Pipeline (Orquestador)
              </h3>
              <p className="text-xs text-slate-400">
                Control de ciclo cerrado: Ingesta → Modelado Machine Learning → Evaluación y Firma Criptográfica.
              </p>
            </div>
          </div>

          {/* Mode Badges */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMode('demo')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === 'demo'
                  ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Modo Demo (Instantáneo)</span>
              </div>
            </button>

            <button
              onClick={() => setMode('real')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === 'real'
                  ? 'bg-gradient-to-r from-violet-500/25 to-purple-500/25 text-violet-300 border border-violet-500/50 shadow-lg shadow-violet-500/10'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Modo Qlib Real (Alpha158)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Phase Selector Grid */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Fases del Pipeline Activas
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ALL_STEPS.map((step) => {
              const isSelected = selectedSteps.includes(step.id)

              return (
                <motion.button
                  key={step.id}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleToggleStep(step.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-white/[0.06] border-cyan-500/50 text-white shadow-md'
                      : 'bg-white/[0.01] border-white/[0.05] text-slate-500 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold tracking-tight">{step.label}</span>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isSelected
                          ? 'bg-cyan-500 text-[#090D16] font-black'
                          : 'bg-white/[0.05] text-slate-600'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Launch Button Strip */}
        <div className="mt-8 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {isRunning ? (
              <span className="text-cyan-300 font-semibold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                Ejecutando en subproceso asíncrono con captura continua...
              </span>
            ) : (
              <span>Parámetros listos. El log fluirá en tiempo real abajo.</span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRunPipeline}
            disabled={isRunning}
            className={`flex items-center space-x-2.5 px-8 py-3 rounded-xl font-bold text-sm text-white tracking-wide transition shadow-xl ${
              isRunning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/[0.05]'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-cyan-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ejecutando Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Lanzar Pipeline Completo</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Glassmorphic Streaming Console */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="p-4 bg-white/[0.02] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            <div className="h-4 w-[1px] bg-white/[0.1]" />

            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
              <TermIcon className="w-4 h-4 text-cyan-400" />
              <span>pipeline.stream • {logs.length} líneas registradas</span>
              {isRunning && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar consola..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 w-36 sm:w-44"
              />
            </div>

            <label className="flex items-center space-x-1.5 text-xs text-slate-400 cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded bg-white/[0.05] border-white/[0.1] text-cyan-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span className="text-[11px] font-mono">Auto-scroll</span>
            </label>

            <button
              onClick={handleCopyLogs}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition"
              title="Copiar registros"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-rose-400 transition"
              title="Limpiar pantalla"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Text Body */}
        <div className="p-5 font-mono text-xs text-slate-300 min-h-[360px] max-h-[520px] overflow-y-auto space-y-1.5 bg-[#05070B]/80 select-text">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 py-16 text-center select-none font-sans text-sm">
              <TermIcon className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
              Esperando ejecución del pipeline. Presiona "Lanzar Pipeline" arriba para ver la telemetría en vivo.
            </div>
          ) : (
            filteredLogs.map((line, idx) => {
              const isSuccess = line.includes('[ÉXITO]') || line.includes('código 0') || line.includes('PASSED')
              const isError = line.includes('[ABORTE]') || line.includes('FAIL') || line.includes('ERROR')
              const isHeader = line.includes('=== [') || line.includes('>>>')
              const isGuard = line.includes('[GUARDIA]')

              return (
                <div key={idx} className="flex items-start space-x-3 leading-relaxed">
                  <span className="text-slate-600 text-[10px] w-7 text-right select-none font-mono">
                    {idx + 1}
                  </span>
                  <div
                    className={`flex-1 whitespace-pre-wrap break-all ${
                      isSuccess
                        ? 'text-emerald-400 font-semibold'
                        : isError
                        ? 'text-rose-400 font-semibold'
                        : isHeader
                        ? 'text-cyan-300 font-bold'
                        : isGuard
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {line}
                  </div>
                </div>
              )
            })
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  )
}
