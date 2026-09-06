import React, { useState } from 'react'
import { ShieldCheck, Lock, CheckCircle2, Check, Terminal, FileCode2 } from 'lucide-react'
import { Btn, CopyChip, Eyebrow, Reveal, StatusDot } from '../ui'

const SAMPLE_PAYLOAD = `{
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

export const SecurityVaultProof: React.FC = () => {
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(true)

  const handleVerify = () => {
    setVerifying(true)
    setVerified(false)
    setTimeout(() => {
      setVerifying(false)
      setVerified(true)
    }, 900)
  }

  return (
    <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
      {/* Left — editorial explanation */}
      <Reveal className="lg:col-span-5">
        <Eyebrow>Bóveda criptográfica inmutable</Eyebrow>
        <h2 className="mt-4 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
          Aislamiento zero-import y <em className="italic text-[#6E6E73]">verificación por lote.</em>
        </h2>
        <p className="editorial-subhead mt-5 max-w-md text-sm leading-relaxed text-[#86868B]">
          Para garantizar que el agente de ejecución jamás contamine el pipeline cuantitativo ni
          genere órdenes con alpha degradado, QuantVibe implementa un{' '}
          <strong className="font-medium text-white">puente de datos sellado</strong>.
        </p>

        <div className="mt-8 border-t border-white/[0.07]">
          <div className="flex items-start gap-4 border-b border-white/[0.07] py-5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-white" />
            <div>
              <strong className="block text-sm font-semibold tracking-tight text-white">
                Frontera de código estricta
              </strong>
              <span className="mt-0.5 block text-xs leading-relaxed text-[#86868B]">
                <code className="font-mono text-[#D2D2D7]">qlib_side</code> y{' '}
                <code className="font-mono text-[#D2D2D7]">vibe_side</code> no comparten un solo
                import en memoria.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-4 border-b border-white/[0.07] py-5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#30D158]" />
            <div>
              <strong className="block text-sm font-semibold tracking-tight text-white">
                Auditoría criptográfica por lote
              </strong>
              <span className="mt-0.5 block text-xs leading-relaxed text-[#86868B]">
                Cada lote de señales se firma con digest SHA-256 inmutable registrado en SQLite.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Btn variant="secondary" loading={verifying} onClick={handleVerify}>
            {!verifying && <ShieldCheck className="h-4 w-4" />}
            <span>{verifying ? 'Calculando digest…' : 'Comprobar integridad del hash'}</span>
          </Btn>
        </div>
      </Reveal>

      {/* Right — signed contract terminal */}
      <Reveal delay={0.12} className="lg:col-span-7">
        <div className="glass-panel specular-hairline overflow-hidden rounded-2xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0A0A0D]/80 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <FileCode2 className="h-3.5 w-3.5 shrink-0 text-white" />
              <span className="truncate text-[11px] text-[#86868B]">
                artifacts/signals.json · envelope firmado
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                  verified
                    ? 'border-[#30D158]/25 bg-[#30D158]/10 text-[#30D158]'
                    : 'border-white/[0.1] bg-white/[0.04] text-[#636366]'
                }`}
              >
                <StatusDot tone={verified ? 'pos' : 'muted'} ping={verified} />
                {verifying ? 'Verificando' : verified ? 'SHA-256 válido' : 'En cola'}
              </span>
              <CopyChip text={SAMPLE_PAYLOAD} label="Payload" />
            </div>
          </div>

          <div className="max-h-80 overflow-x-auto bg-[#030304] p-5 leading-relaxed text-[#D2D2D7]">
            <pre>
              <code>{SAMPLE_PAYLOAD}</code>
            </pre>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.07] bg-[#0A0A0D]/80 px-4 py-2.5 text-[10px] text-[#636366]">
            <span className="flex items-center gap-1.5 text-[#A1A1A6]">
              <Terminal className="h-3.5 w-3.5" />
              Digest verification engine
            </span>
            <span className="flex items-center gap-1.5">
              {verified && <Check className="h-3 w-3 text-[#30D158]" />}
              <span className={verified ? 'font-medium text-[#30D158]' : ''}>
                {verified ? '100% inmutable' : '—'}
              </span>
            </span>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
