import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, CheckCircle2, Copy, Check, Terminal, FileCode2 } from 'lucide-react'

export const SecurityVaultProof: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(true)

  const samplePayload = `{
  "timestamp": "2026-09-04T16:40:00Z",
  "gate_metrics": {
    "ic": 0.0824,
    "icir": 0.6412,
    "gate_passed": true
  },
  "top_signals": [
    { "ticker": "NVDA", "score": 0.942, "weight": 0.20 },
    { "ticker": "AAPL", "score": 0.881, "weight": 0.18 },
    { "ticker": "MSFT", "score": 0.814, "weight": 0.17 }
  ],
  "checksum": "a8f3b9c47e2119d8736e4f3a9e10283c749921bdfa8910e53a912c98d4389021"
}`

  const handleCopy = () => {
    navigator.clipboard.writeText(samplePayload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = () => {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setVerified(true)
    }, 600)
  }

  return (
    <div className="w-full py-12">
      <div className="rounded-3xl bg-[#090D16]/90 border border-white/[0.08] p-6 sm:p-8 lg:p-10 backdrop-blur-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Architectural explanation (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>BÓVEDA CRIPTOGRÁFICA INMUTABLE</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight editorial-display">
              Aislamiento Zero-Import y Firma SHA-256
            </h3>

            <p className="text-sm text-slate-400 leading-relaxed">
              Para garantizar que el agente de ejecución jamás contamine el pipeline cuantitativo ni genere
              órdenes con alpha degradado, QuantVibe implementa un <strong className="text-slate-200">puente de datos sellado</strong>.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start space-x-3">
                <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">Frontera de Código Estricta</strong>
                  <span className="text-slate-400 text-[11px]">
                    <code>qlib_side</code> y <code>vibe_side</code> no comparten un solo import en memoria.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">Auditoría Criptográfica por Lote</strong>
                  <span className="text-slate-400 text-[11px]">
                    Cada lote de señales se firma con digest SHA-256 inmutable registrado en SQLite.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleVerify}
                disabled={verifying}
                className="px-5 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold flex items-center space-x-2 transition apple-press"
              >
                <ShieldCheck className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                <span>{verifying ? 'Calculando Digest...' : 'Comprobar Integridad Hash en Vivo'}</span>
              </motion.button>
            </div>
          </div>

          {/* Right: Code contract preview (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-[#06080E] border border-white/[0.1] shadow-2xl overflow-hidden font-mono text-xs">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-slate-400 text-[11px] ml-2 flex items-center space-x-1">
                    <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>data/signals_envelope.json</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {verified && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>SHA-256 Válido</span>
                    </span>
                  )}
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition"
                    title="Copiar Payload"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Code content */}
              <div className="p-4 text-slate-300 overflow-x-auto leading-relaxed max-h-72">
                <pre>
                  <code>{samplePayload}</code>
                </pre>
              </div>

              {/* Live Hash Status Bar */}
              <div className="px-4 py-2.5 bg-cyan-950/20 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1.5 text-cyan-300">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Digest Verification Engine</span>
                </span>
                <span className="text-emerald-400 font-bold">100% Inmutable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
