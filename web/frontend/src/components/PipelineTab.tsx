import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Terminal as TermIcon,
  Copy,
  Trash2,
  CheckCircle,
  Loader2,
  Sliders,
} from 'lucide-react'
import { runPipeline } from '../api'
import type { SystemStatus } from '../types'

interface PipelineTabProps {
  status: SystemStatus | null
  onPipelineFinished: () => void
}

const ALL_STEPS = ['prepare', 'settle', 'train', 'export', 'execute']

export const PipelineTab: React.FC<PipelineTabProps> = ({
  status,
  onPipelineFinished,
}) => {
  const [mode, setMode] = useState<'demo' | 'real'>('demo')
  const [selectedSteps, setSelectedSteps] = useState<string[]>(ALL_STEPS)
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [copied, setCopied] = useState(false)
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Sync isRunning with backend status
  useEffect(() => {
    if (status?.pipeline.is_running !== undefined) {
      setIsRunning(status.pipeline.is_running)
    }
  }, [status])

  // Setup EventSource for real-time log streaming
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
          es.close()
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err)
      }
    }

    es.onerror = () => {
      es.close()
    }
  }

  useEffect(() => {
    // Initial fetch of logs if running or logs exist
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

  // Auto-scroll terminal
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const handleToggleStep = (step: string) => {
    setSelectedSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    )
  }

  const handleRunPipeline = async () => {
    if (selectedSteps.length === 0) {
      alert('Selecciona al menos un paso para ejecutar.')
      return
    }

    setIsRunning(true)
    setLogs((prev) => [
      ...prev,
      `\n-----------------------------------------------------------`,
      `[CLIENTE] Solicitando ejecución del pipeline (${mode.toUpperCase()})...`,
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

  const formatLogLine = (line: string) => {
    if (line.includes('[ÉXITO]') || line.includes('PASSED') || line.includes('código 0')) {
      return <span className="text-emerald-400 font-semibold">{line}</span>
    }
    if (line.includes('[ABORTE]') || line.includes('FAIL') || line.includes('ERROR')) {
      return <span className="text-rose-400 font-semibold">{line}</span>
    }
    if (line.includes('=== [') || line.includes('>>>')) {
      return <span className="text-cyan-400 font-bold">{line}</span>
    }
    if (line.includes('[GUARDIA]')) {
      return <span className="text-amber-300">{line}</span>
    }
    return <span className="text-slate-300">{line}</span>
  }

  return (
    <div className="space-y-6">
      {/* Configuration & Controls Card */}
      <div className="bg-dark-800/80 border border-dark-600 rounded-xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-dark-600 pb-3 mb-4">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono font-semibold text-sm text-white">
            Panel de Control del Orquestador (run_pipeline.py)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Modo de Ejecución
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('demo')}
                className={`p-3 rounded-lg border text-left font-mono transition ${
                  mode === 'demo'
                    ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-950'
                    : 'bg-dark-900 border-dark-700 text-slate-400 hover:bg-dark-700'
                }`}
              >
                <div className="font-bold text-xs">Modo Demo</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Momentum fallback + sintéticos (Sin Qlib pesado)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('real')}
                className={`p-3 rounded-lg border text-left font-mono transition ${
                  mode === 'real'
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-300 shadow-md shadow-purple-950'
                    : 'bg-dark-900 border-dark-700 text-slate-400 hover:bg-dark-700'
                }`}
              >
                <div className="font-bold text-xs">Modo Qlib Real</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Alpha158 + LightGBM (Requiere venv qlib)
                </div>
              </button>
            </div>
          </div>

          {/* Steps Checklist */}
          <div className="md:col-span-2">
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Fases del Pipeline a Ejecutar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ALL_STEPS.map((step) => {
                const isSelected = selectedSteps.includes(step)
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleToggleStep(step)}
                    className={`px-3 py-2 rounded-lg border font-mono text-xs text-center transition ${
                      isSelected
                        ? 'bg-dark-700 border-cyan-500/50 text-white font-bold'
                        : 'bg-dark-900 border-dark-700 text-slate-500 hover:bg-dark-800'
                    }`}
                  >
                    <span className="capitalize">{step}</span>
                  </button>
                )
              })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Secuencia: prepare (datos) → settle (liquidación SQLite) → train (ML) → export (gate + firma) → execute (plan)
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-4 border-t border-dark-600 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            {isRunning ? (
              <span className="text-cyan-400 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Ejecutando proceso en segundo plano...
              </span>
            ) : (
              <span>Listo para lanzar. Presiona el botón para iniciar.</span>
            )}
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className={`flex items-center space-x-2 py-2.5 px-6 rounded-lg font-mono font-bold text-xs sm:text-sm text-white transition shadow-lg ${
              isRunning
                ? 'bg-dark-700 border border-dark-600 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/40'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ejecutando...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Ejecutar Pipeline Completo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Terminal Window */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-dark-800 px-4 py-2.5 border-b border-dark-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TermIcon className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs text-slate-200 font-semibold">
              Live Console Output (Server-Sent Events)
            </span>
            {isRunning && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1.5 text-xs text-slate-400 cursor-pointer mr-2">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded bg-dark-900 border-dark-600 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span className="font-mono text-[11px]">Auto-scroll</span>
            </label>

            <button
              onClick={handleCopyLogs}
              className="p-1.5 rounded bg-dark-700 text-slate-300 hover:text-white hover:bg-dark-600 transition"
              title="Copiar registros"
            >
              {copied ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded bg-dark-700 text-slate-300 hover:text-rose-300 hover:bg-dark-600 transition"
              title="Limpiar consola"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Screen */}
        <div className="p-4 font-mono text-xs text-slate-300 min-h-[350px] max-h-[500px] overflow-y-auto space-y-1 bg-[#070A0F]">
          {logs.length === 0 ? (
            <div className="text-slate-600 py-12 text-center select-none font-mono">
              Consola a la espera. Inicia una ejecución para ver el flujo en vivo.
            </div>
          ) : (
            logs.map((line, idx) => (
              <div key={idx} className="leading-relaxed whitespace-pre-wrap break-all">
                {formatLogLine(line)}
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  )
}
