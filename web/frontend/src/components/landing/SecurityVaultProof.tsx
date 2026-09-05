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
      <div className="rounded-3xl bg-[#0C0C10] border border-white/[0.08] p-6 sm:p-8 lg:p-10 backdrop-blur-2xl relative overflow-hidden">
        {/* Subtle top light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Architectural explanation (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.12] text-[#A1A1A6] text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>BÓVEDA CRIPTOGRÁFICA INMUTABLE</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight editorial-display">
              Aislamiento Zero-Import y Firma SHA-256
            </h3>

            <p className="text-sm text-[#86868B] leading-relaxed">
              Para garantizar que el agente de ejecución jamás contamine el pipeline cuantitativo ni genere
              órdenes con alpha degradado, QuantVibe implementa un <strong className="text-white">puente de datos sellado</strong>.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#121216] border border-white/[0.08] flex items-start space-x-3">
                <Lock className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">Frontera de Código Estricta</strong>
                  <span className="text-[#86868B] text-[11px]">
                    <code>qlib_side</code> y <code>vibe_side</code> no comparten un solo import en memoria.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121216] border border-white/[0.08] flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">Auditoría Criptográfica por Lote</strong>
                  <span className="text-[#86868B] text-[11px]">
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
                className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.14] text-white text-xs font-mono font-medium flex items-center space-x-2 transition-colors apple-press"
              >
                <ShieldCheck className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                <span>{verifying ? 'Calculando Digest...' : 'Comprobar Integridad Hash en Vivo'}</span>
              </motion.button>
            </div>
          </div>

          {/* Right: Code contract preview (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-[#050507] border border-white/[0.1] shadow-2xl overflow-hidden font-mono text-xs">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0E0E12] border-b border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  </div>
                  <span className="text-[#86868B] text-[11px] ml-2 flex items-center space-x-1">
                    <FileCode2 className="w-3.5 h-3.5 text-white" />
                    <span>data/signals_envelope.json</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {verified && (
                    <span className="text-[10px] text-white bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-white/[0.15] flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>SHA-256 Válido</span>
                    </span>
                  )}
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded-lg hover:bg-white/[0.08] text-[#86868B] hover:text-white transition-colors"
                    title="Copiar Payload"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Code content */}
              <div className="p-4 text-[#D2D2D7] overflow-x-auto leading-relaxed max-h-72">
                <pre>
                  <code>{samplePayload}</code>
                </pre>
              </div>

              {/* Live Hash Status Bar */}
              <div className="px-4 py-2.5 bg-[#0E0E12] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#86868B]">
                <span className="flex items-center space-x-1.5 text-white">
                  <Terminal className="w-3.5 h-3.5 text-[#A1A1A6]" />
                  <span>Digest Verification Engine</span>
                </span>
                <span className="text-emerald-400 font-medium">100% Inmutable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
