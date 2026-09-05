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
import { runPipeline, getApiBase } from '../api'
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

    const es = new EventSource(`${getApiBase()}/pipeline/logs/stream`)
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
            colors: ['#FFFFFF', '#E8E8ED', '#86868B', '#30D158'],
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
        const res = await fetch(`${getApiBase()}/pipeline/logs`)
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
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0C0C10] border border-white/[0.09] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#F5F5F7]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#F5F5F7] tracking-[-0.03em]">
                Centro de Mando del Pipeline
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                Control de ciclo cerrado: Ingesta → Modelado Machine Learning → Evaluación y Firma Criptográfica.
              </p>
            </div>
          </div>

          {/* Mode Selector - Apple Segmented Pill */}
          <div className="flex items-center p-1 rounded-full bg-[#1C1C1E] border border-white/[0.08] self-start sm:self-auto">
            <button
              onClick={() => setMode('demo')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mode === 'demo'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#86868B] hover:text-[#F5F5F7]'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Modo Demo</span>
              </div>
            </button>

            <button
              onClick={() => setMode('real')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mode === 'real'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#86868B] hover:text-[#F5F5F7]'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modo Qlib Real (Alpha158)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Phase Selector Grid */}
        <div className="space-y-3">
          <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
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
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#141418] border-white/[0.22] text-[#F5F5F7] shadow-lg shadow-black/40'
                      : 'bg-[#08080A] border-white/[0.05] text-[#86868B] hover:bg-[#101014] hover:text-[#D1D1D6]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold tracking-tight">{step.label}</span>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isSelected
                          ? 'bg-white text-black font-black'
                          : 'bg-white/[0.05] text-transparent'
                      }`}
                    >
                      {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#86868B] leading-tight">{step.desc}</p>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Launch Button Strip */}
        <div className="mt-8 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-[#86868B] flex items-center gap-2">
            {isRunning ? (
              <span className="text-[#F5F5F7] font-medium flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Ejecutando en subproceso asíncrono con captura continua...
              </span>
            ) : (
              <span>Parámetros configurados. La telemetría fluirá en tiempo real abajo.</span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: isRunning ? 1 : 1.02 }}
            whileTap={{ scale: isRunning ? 1 : 0.98 }}
            onClick={handleRunPipeline}
            disabled={isRunning}
            className={`flex items-center space-x-2.5 px-8 py-3 rounded-full font-semibold text-xs sm:text-sm tracking-tight transition shadow-xl ${
              isRunning
                ? 'bg-[#1C1C1E] text-[#86868B] cursor-not-allowed border border-white/[0.08]'
                : 'apple-btn-primary'
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

      {/* macOS Pro Terminal Console */}
      <div className="rounded-3xl overflow-hidden bg-[#070709] border border-white/[0.1] shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="p-3.5 sm:px-5 bg-[#121216] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            {/* macOS Traffic Lights */}
            <div className="flex space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 inline-block shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 inline-block shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 inline-block shadow-sm" />
            </div>

            <div className="h-4 w-[1px] bg-white/[0.12]" />

            <div className="flex items-center space-x-2 text-xs font-mono text-[#A1A1A6]">
              <TermIcon className="w-4 h-4 text-[#F5F5F7]" />
              <span>pipeline.stream • {logs.length} líneas</span>
              {isRunning && (
                <span className="w-2 h-2 rounded-full bg-[#30D158] animate-ping" />
              )}
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-[#86868B]" />
              <input
                type="text"
                placeholder="Buscar en consola..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="bg-black/50 border border-white/[0.1] rounded-full pl-8 pr-3 py-1 text-xs font-mono text-white placeholder-[#86868B] focus:outline-none focus:border-white/30 w-36 sm:w-48"
              />
            </div>

            <label className="flex items-center space-x-1.5 text-xs text-[#86868B] cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded bg-white/[0.05] border-white/[0.1] text-white focus:ring-0 w-3.5 h-3.5 accent-white"
              />
              <span className="text-[11px] font-mono">Auto-scroll</span>
            </label>

            <button
              onClick={handleCopyLogs}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-[#A1A1A6] hover:text-[#F5F5F7] transition"
              title="Copiar registros"
            >
              {copied ? <Check className="w-4 h-4 text-[#30D158]" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-[#A1A1A6] hover:text-[#FF453A] transition"
              title="Limpiar pantalla"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Text Body */}
        <div className="p-5 font-mono text-xs text-[#D1D1D6] min-h-[360px] max-h-[520px] overflow-y-auto space-y-1.5 bg-[#050507] select-text">
          {filteredLogs.length === 0 ? (
            <div className="text-[#86868B] py-16 text-center select-none font-sans text-sm">
              <TermIcon className="w-8 h-8 text-[#48484A] mx-auto mb-2 opacity-60" />
              Esperando ejecución del pipeline. Presiona &quot;Lanzar Pipeline&quot; arriba para ver la telemetría en vivo.
            </div>
          ) : (
            filteredLogs.map((line, idx) => {
              const isSuccess = line.includes('[ÉXITO]') || line.includes('código 0') || line.includes('PASSED')
              const isError = line.includes('[ABORTE]') || line.includes('FAIL') || line.includes('ERROR')
              const isHeader = line.includes('=== [') || line.includes('>>>')
              const isGuard = line.includes('[GUARDIA]')

              return (
                <div key={idx} className="flex items-start space-x-3 leading-relaxed">
                  <span className="text-[#48484A] text-[10px] w-8 text-right select-none font-mono pt-0.5">
                    {idx + 1}
                  </span>
                  <div
                    className={`flex-1 whitespace-pre-wrap break-all ${
                      isSuccess
                        ? 'text-[#30D158] font-semibold'
                        : isError
                        ? 'text-[#FF453A] font-semibold'
                        : isHeader
                        ? 'text-[#F5F5F7] font-bold border-l-2 border-white/40 pl-2'
                        : isGuard
                        ? 'text-[#FFD60A]'
                        : 'text-[#D1D1D6]'
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
