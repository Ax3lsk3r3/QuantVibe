import React, { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import {
  Play,
  Terminal as TermIcon,
  Copy,
  Trash2,
  Search,
  Check,
} from 'lucide-react'
import { runPipeline, getApiBase } from '../api'
import type { SystemStatus } from '../types'
import { Btn, Eyebrow, Segmented, StatusDot, cn } from './ui'

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (status?.pipeline.is_running !== undefined) {
      setIsRunning(status.pipeline.is_running)
    }
  }, [status])

  const celebrate = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFFFFF', '#E8E8ED', '#86868B', '#30D158'],
    })
  }

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
          celebrate()
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

  // Resilient polling fallback: guarantees real-time terminal output even if Cloudflare or Nginx buffers SSE
  useEffect(() => {
    if (!isRunning) return

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${getApiBase()}/pipeline/logs`)
        if (res.ok) {
          const data = await res.json()
          if (data.logs && Array.isArray(data.logs)) {
            setLogs((prev) => (data.logs.length > prev.length ? data.logs : prev))
          }
          if (data.is_running === false) {
            setIsRunning(false)
            onPipelineFinished()
            celebrate()
          }
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 800)

    return () => clearInterval(pollInterval)
  }, [isRunning, onPipelineFinished])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setErrorMsg('Debes seleccionar al menos una fase activa del pipeline para iniciar el cómputo.')
      setTimeout(() => setErrorMsg(null), 5000)
      return
    }
    setErrorMsg(null)

    setIsRunning(true)
    setLogs((prev) => [
      ...prev,
      `\n-----------------------------------------------------------`,
      `[CLIENTE] Invocando pipeline en modo: ${mode.toUpperCase()}...`,
    ])

    try {
      await runPipeline(mode, selectedSteps)
      connectSSE()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setLogs((prev) => [...prev, `[ERROR AL INICIAR] ${message}`])
      setIsRunning(false)
      setErrorMsg(`No se pudo iniciar el pipeline: ${message}`)
    }
  }

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n')).catch(() => {})
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
    <div className="space-y-10 font-sans">
      {/* 1. Editorial command head + mode selector */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Eyebrow>
            <span className="flex items-center gap-2">
              <StatusDot tone={isRunning ? 'pos' : 'muted'} ping={isRunning} />
              Consola de factores · ciclo cerrado
            </span>
          </Eyebrow>
          <h1 className="mt-3 font-sans text-4xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl">
            Centro de mando del <span className="text-[#86868B] font-semibold">pipeline.</span>
          </h1>
          <p className="editorial-subhead mt-3 max-w-xl text-sm leading-relaxed text-[#86868B]">
            Ingesta → modelado ML → evaluación y firma criptográfica. La telemetría fluye en tiempo
            real vía SSE con respaldo de polling resistente a proxies.
          </p>
        </div>

        <Segmented
          layoutId="pipelineMode"
          value={mode}
          onChange={(id) => setMode(id as 'demo' | 'real')}
          options={[
            { id: 'demo', label: 'Modo Demo' },
            { id: 'real', label: 'Qlib Real (Alpha158)' },
          ]}
        />
      </div>

      {/* 2. Phase selector — hairline matrix rail (toggle cells) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#86868B]">
            Fases activas · {selectedSteps.length}/{ALL_STEPS.length}
          </span>
          <span className="font-mono text-[10px] text-[#48484A]">click para alternar</span>
        </div>
        <div className="grid grid-cols-1 border-l border-t border-white/[0.07] sm:grid-cols-2 lg:grid-cols-5">
          {ALL_STEPS.map((step) => {
            const isSelected = selectedSteps.includes(step.id)
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleToggleStep(step.id)}
                aria-pressed={isSelected}
                className={cn(
                  'group border-b border-r border-white/[0.07] p-4 text-left transition-colors',
                  isSelected ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-xs font-bold tracking-tight',
                      isSelected ? 'text-white' : 'text-[#86868B]'
                    )}
                  >
                    {step.label}
                  </span>
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                      isSelected
                        ? 'border-white bg-white text-black'
                        : 'border-white/20 text-transparent'
                    )}
                  >
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-tight text-[#636366]">{step.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Validation error banner (explicit error state) */}
      {errorMsg && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#FF453A]/30 bg-[#FF453A]/[0.07] px-4 py-3 font-mono text-xs text-[#FF8A80]">
          <span className="flex items-center gap-2">
            <StatusDot tone="neg" ping />
            {errorMsg}
          </span>
          <button
            onClick={() => setErrorMsg(null)}
            className="shrink-0 rounded px-2 py-0.5 transition-colors hover:bg-[#FF453A]/20"
          >
            Descartar
          </button>
        </div>
      )}

      {/* 3. Launch bar */}
      <div className="flex flex-col items-start justify-between gap-4 border-y border-white/[0.07] py-5 sm:flex-row sm:items-center">
        <span className="font-mono text-[11px] text-[#636366]">
          {isRunning
            ? 'ejecutando en subproceso asíncrono con captura continua…'
            : 'parámetros configurados · la telemetría fluirá abajo en tiempo real'}
        </span>
        <Btn size="lg" loading={isRunning} disabled={isRunning} onClick={handleRunPipeline}>
          {!isRunning && <Play className="h-4 w-4 fill-current" />}
          <span>{isRunning ? 'Ejecutando pipeline…' : 'Lanzar pipeline completo'}</span>
        </Btn>
      </div>

      {/* 4. Terminal console */}
      <div className="glass-panel specular-hairline overflow-hidden rounded-2xl">
        {/* Console chrome */}
        <div className="flex flex-col gap-3 border-b border-white/[0.07] bg-[#0A0A0D]/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3 font-mono text-xs text-[#A1A1A6]">
            <span
              className={cn(
                'flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest',
                isRunning
                  ? 'border-[#30D158]/30 bg-[#30D158]/10 text-[#30D158]'
                  : 'border-white/[0.1] bg-white/[0.03] text-[#636366]'
              )}
            >
              <StatusDot tone={isRunning ? 'pos' : 'muted'} ping={isRunning} />
              {isRunning ? 'Live' : 'Idle'}
            </span>
            <TermIcon className="h-4 w-4 text-[#F5F5F7]" />
            <span>pipeline.stream · {logs.length} líneas</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#636366]" />
              <input
                type="text"
                placeholder="Buscar en consola…"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                aria-label="Buscar en los logs"
                className="w-36 rounded-full border border-white/[0.1] bg-black/50 py-1 pl-8 pr-3 font-mono text-xs text-white placeholder-[#636366] transition-colors focus:border-white/30 focus:outline-none sm:w-48"
              />
            </div>

            <label className="ml-1 flex cursor-pointer items-center gap-1.5 font-mono text-[11px] text-[#86868B]">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/[0.1] bg-white/[0.05] accent-white"
              />
              Auto-scroll
            </label>

            <button
              onClick={handleCopyLogs}
              aria-label="Copiar registros"
              title="Copiar registros"
              className="rounded-lg bg-white/[0.05] p-1.5 text-[#A1A1A6] transition-colors hover:bg-white/[0.12] hover:text-white"
            >
              {copied ? <Check className="h-4 w-4 text-[#30D158]" /> : <Copy className="h-4 w-4" />}
            </button>

            <button
              onClick={handleClearLogs}
              aria-label="Limpiar pantalla"
              title="Limpiar pantalla"
              className="rounded-lg bg-white/[0.05] p-1.5 text-[#A1A1A6] transition-colors hover:bg-white/[0.12] hover:text-[#FF453A]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Console body */}
        <div className="max-h-[520px] min-h-[360px] select-text space-y-1.5 overflow-y-auto bg-[#030304] p-5 font-mono text-xs text-[#D1D1D6]">
          {filteredLogs.length === 0 ? (
            <div className="select-none py-16 text-center">
              <TermIcon className="mx-auto mb-2 h-8 w-8 text-[#2C2C2E]" />
              <span className="font-sans text-sm text-[#636366]">
                Esperando ejecución. Presiona «Lanzar pipeline completo» para ver la telemetría en
                vivo.
              </span>
            </div>
          ) : (
            filteredLogs.map((line, idx) => {
              const isSuccess = line.includes('[ÉXITO]') || line.includes('código 0') || line.includes('PASSED')
              const isError = line.includes('[ABORTE]') || line.includes('FAIL') || line.includes('ERROR')
              const isHeader = line.includes('=== [') || line.includes('>>>')
              const isGuard = line.includes('[GUARDIA]')

              return (
                <div key={idx} className="flex items-start gap-3 leading-relaxed">
                  <span className="w-8 shrink-0 pt-0.5 text-right font-mono text-[10px] text-[#3A3A3C] select-none">
                    {idx + 1}
                  </span>
                  <div
                    className={cn(
                      'flex-1 break-all whitespace-pre-wrap',
                      isSuccess
                        ? 'font-semibold text-[#30D158]'
                        : isError
                        ? 'font-semibold text-[#FF453A]'
                        : isHeader
                        ? 'border-l-2 border-white/40 pl-2 font-bold text-[#F5F5F7]'
                        : isGuard
                        ? 'text-[#FFD60A]'
                        : 'text-[#D1D1D6]'
                    )}
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
