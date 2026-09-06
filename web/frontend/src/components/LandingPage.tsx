import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Lock, ShieldCheck, Fingerprint, Radio, Tv, Newspaper, Cpu } from 'lucide-react'
import { KineticTitle } from './landing/KineticTitle'
import { TextSwap } from './landing/TextSwap'
import { InteractiveSimulator } from './landing/InteractiveSimulator'
import { ComparisonMatrix } from './landing/ComparisonMatrix'
import { SecurityVaultProof } from './landing/SecurityVaultProof'
import { TrackRecordShowcase } from './landing/TrackRecordShowcase'
import type { EvaluationData, SignalsResponse } from '../types'
import {
  Btn,
  CopyChip,
  DataRow,
  Eyebrow,
  Panel,
  Reveal,
  Section,
  SectionHead,
  Segmented,
  StatusDot,
  cn,
} from './ui'

interface LandingPageProps {
  onNavigateToTab: (tab: string) => void
  signals: SignalsResponse | null
  evaluation: EvaluationData | null
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToTab,
  signals,
  evaluation,
}) => {
  const [consoleTab, setConsoleTab] = useState<'signals' | 'gate' | 'crypto'>('signals')

  const payload = signals?.payload
  const topSignals = payload?.signals?.slice(0, 5) ?? []
  const maxScore = Math.max(...topSignals.map((s) => Math.abs(s.score)), 0.0001)

  const dynamicPhrases = [
    'Factor Mining con 158 Alphas de Microsoft Qlib',
    'Gate matemático ineludible antes de cualquier orden',
    'Construcción de portafolio autónoma mediante agente LLM',
    'Bóveda criptográfica con sellado SHA-256 inmutable',
    'Aislamiento estricto Zero-Import entre Qlib y Vibe',
    'Doble blindaje de ejecución (--submit + VIBE_ALLOW_ORDERS)',
  ]

  const trustRail = [
    { label: 'Motor', value: payload?.source_model ?? 'Alpha158 · LightGBM' },
    { label: 'Universo', value: `${payload?.universe?.length ?? 10} activos` },
    {
      label: 'Mean IC',
      value: evaluation ? `+${evaluation.mean_ic.toFixed(4)}` : '—',
    },
    {
      label: 'Horizonte',
      value: `${payload?.horizon_days ?? 1}d walk-forward`,
    },
  ]

  const mediaCapabilities = [
    {
      n: '01',
      icon: Tv,
      title: 'Bloomberg Television 24/7',
      desc: 'Señal satelital oficial en directo: Wall Street, bancos centrales y geopolítica.',
    },
    {
      n: '02',
      icon: Radio,
      title: 'La Estrategia del Día',
      desc: 'Podcast diario oficial (Colombia, México, Argentina) embebido desde Spotify.',
    },
    {
      n: '03',
      icon: Newspaper,
      title: 'Wire Bloomberg Línea',
      desc: 'RSS certificado con cobertura LatAm y EE. U. sincronizado cada 5 minutos.',
    },
    {
      n: '04',
      icon: Cpu,
      title: 'Screener & Market Overview',
      desc: 'Widgets institucionales de TradingView con datos reales de mercado en vivo.',
    },
  ]

  const invariants = [
    {
      n: '01',
      title: 'Cerebro Cuantitativo Qlib',
      desc: '158 factores Alpha continuos y árboles gradient-boosted (LightGBM) sobre ventanas móviles walk-forward. Las predicciones nacen de estadística, nunca de texto.',
      tag: 'Alpha158 · LGBModel',
    },
    {
      n: '02',
      title: 'Firewall Matemático (Gate)',
      desc: 'Filtro implacable previo a cualquier orden: si el Information Coefficient o su estabilidad (ICIR) caen bajo el umbral, la puerta se cierra y el sistema aborta.',
      tag: 'Fail-Safe Activo',
      tagTone: 'text-[#30D158]' as const,
    },
    {
      n: '03',
      title: 'Manos Agénticas Vibe',
      desc: 'El agente LLM dimensiona liquidez y tamaño de orden bajo invariantes estrictos: máximo 20% por posición, doble confirmación y registro inmutable en SQLite.',
      tag: 'Max Cap 20% · Doble Guardia',
    },
  ]

  return (
    <div className="relative w-full">
      {/* ═══════════════ 1. HERO — Asymmetric editorial + live console (Z-depth) ═══════════════ */}
      <section className="relative grid grid-cols-1 items-center gap-12 pb-20 pt-10 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-16">
        {/* Hero rim light */}
        <div
          className="pointer-events-none absolute -top-24 left-1/4 h-[480px] w-[720px] rounded-full bg-white/[0.04] blur-[150px]"
          aria-hidden
        />

        {/* Left — monumental editorial column */}
        <div className="relative lg:col-span-7 lg:pr-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Eyebrow>Quantitative Brain × Autonomous Hands</Eyebrow>
          </motion.div>

          <div className="mt-6">
            <TextSwap phrases={dynamicPhrases} intervalMs={3400} />
          </div>

          <div className="mt-5">
            <KineticTitle
              serif
              text="El rigor cuantitativo institucional, con manos autónomas"
              italicWord="autónomas"
              className="text-[2.6rem] sm:text-6xl lg:text-7xl xl:text-[5.2rem]"
            />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="editorial-subhead mt-7 max-w-xl text-[15px] leading-relaxed text-[#86868B]"
          >
            QuantVibe orquesta el pipeline completo de finanzas computacionales: minado de 158
            factores con <strong className="font-medium text-[#F5F5F7]">Microsoft Qlib</strong>,
            validación con firewall matemático ineludible y ejecución autónoma mediante agentes LLM
            protegidos bajo digest criptográfico{' '}
            <span className="font-mono text-[13px] font-semibold text-white">SHA-256</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Btn size="lg" onClick={() => onNavigateToTab('overview')}>
              <span>Entrar a Alpha Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Btn>
            <Btn variant="secondary" size="lg" onClick={() => onNavigateToTab('bloomberg')}>
              <StatusDot tone="neg" ping />
              <span>Terminal Bloomberg en vivo</span>
            </Btn>
          </motion.div>

          {/* Trust rail — hairline matrix, real data */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12 grid max-w-2xl grid-cols-2 border-l border-t border-white/[0.07] sm:grid-cols-4"
          >
            {trustRail.map((t) => (
              <div key={t.label} className="border-b border-r border-white/[0.07] px-4 py-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#636366]">
                  {t.label}
                </div>
                <div className="tnum mt-1 truncate font-mono text-[13px] font-bold text-white">
                  {t.value}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — floating live console (glass, overlapping depth) */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:col-span-5"
        >
          <div className="pointer-events-none absolute -inset-8 rounded-full bg-white/[0.025] blur-[90px]" aria-hidden />
          <Panel
            className="relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95)]"
            eyebrow={
              <span className="flex items-center gap-2">
                <StatusDot tone="pos" ping />
                quantvibe-terminal · node: alibaba-ecs
              </span>
            }
            title="Telemetría en vivo"
            right={
              <Segmented
                size="sm"
                layoutId="landingConsole"
                value={consoleTab}
                onChange={(id) => setConsoleTab(id as typeof consoleTab)}
                options={[
                  { id: 'signals', label: 'Señales' },
                  { id: 'gate', label: 'Gate' },
                  { id: 'crypto', label: 'Firma' },
                ]}
              />
            }
            bodyClass="p-0 min-h-[340px]"
          >
            <AnimatePresence mode="wait">
              {/* Real top signals */}
              {consoleTab === 'signals' && (
                <motion.div
                  key="signals"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {topSignals.length === 0 ? (
                    <ConsoleEmpty />
                  ) : (
                    topSignals.map((s) => (
                      <DataRow key={s.instrument}>
                        <div className="flex items-center gap-3">
                          <span className="w-6 font-mono text-[10px] text-[#636366]">#{s.rank}</span>
                          <span className="text-sm font-bold tracking-tight text-white">
                            {s.instrument}
                          </span>
                          <span className="badge-terminal-green rounded px-1.5 py-px font-mono text-[9px] font-bold">
                            TOP-K
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="hidden h-1 w-24 overflow-hidden rounded-full bg-white/[0.06] sm:block">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(Math.abs(s.score) / maxScore) * 100}%` }}
                              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full rounded-full bg-gradient-to-r from-[#86868B] to-white"
                            />
                          </div>
                          <span className="tnum font-mono text-xs font-semibold text-white">
                            {s.score >= 0 ? '+' : ''}
                            {s.score.toFixed(4)}
                          </span>
                        </div>
                      </DataRow>
                    ))
                  )}
                  <div className="flex items-center justify-between px-4 py-3 font-mono text-[10px] text-[#636366]">
                    <span>as_of: {payload?.as_of ?? '—'}</span>
                    <button
                      onClick={() => onNavigateToTab('overview')}
                      className="flex items-center gap-1 text-[#A1A1A6] transition-colors hover:text-white"
                    >
                      Ver ranking completo <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Real gate metrics */}
              {consoleTab === 'gate' && (
                <motion.div
                  key="gate"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="p-5"
                >
                  {!evaluation ? (
                    <ConsoleEmpty />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#86868B]">
                          Veredicto del firewall
                        </span>
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest',
                            evaluation.passed ? 'badge-terminal-green' : 'badge-terminal-red'
                          )}
                        >
                          {evaluation.passed ? 'Aprobado' : 'Rechazado'}
                        </span>
                      </div>
                      {[
                        { k: 'Mean IC (Spearman)', v: `+${evaluation.mean_ic.toFixed(4)}` },
                        { k: 'ICIR (estabilidad)', v: `+${evaluation.icir.toFixed(3)}` },
                        {
                          k: 'Hit-Rate Top-K',
                          v: `${(evaluation.hit_rate_topk * 100).toFixed(1)}%`,
                        },
                        { k: 'Sesiones walk-forward', v: `${evaluation.n_days}` },
                      ].map((row) => (
                        <div
                          key={row.k}
                          className="flex items-center justify-between border-b border-white/[0.06] pb-3 last:border-b-0"
                        >
                          <span className="text-xs text-[#86868B]">{row.k}</span>
                          <span className="tnum font-mono text-base font-bold text-white">
                            {row.v}
                          </span>
                        </div>
                      ))}
                      <p className="pt-1 font-mono text-[10px] leading-relaxed text-[#636366]">
                        umbral mínimo: IC ≥ {evaluation.thresholds?.min_mean_ic ?? 0} · ICIR ≥{' '}
                        {evaluation.thresholds?.min_icir ?? 0}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Real checksum */}
              {consoleTab === 'crypto' && (
                <motion.div
                  key="crypto"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4 p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#86868B]">
                      <Fingerprint className="h-3.5 w-3.5 text-white" />
                      Digest SHA-256 canónico
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest',
                        signals?.verified ? 'badge-terminal-green' : 'badge-terminal-neutral'
                      )}
                    >
                      {signals?.verified ? 'Verificado' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/[0.07] bg-black/60 p-3.5 font-mono text-[11px] leading-relaxed text-[#E5E5EA] select-all break-all">
                    {signals?.checksum ?? 'sincronizando firma del lote…'}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {signals?.checksum && <CopyChip text={signals.checksum} label="Copiar hash" />}
                    <span className="font-mono text-[10px] text-[#636366]">
                      computed: {signals?.computed_checksum ? 'match ✓' : '—'}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] leading-relaxed text-[#636366]">
                    schema v{payload?.schema_version ?? '1.0'} · ranks contiguos verificados ·
                    barrera zero-import activa
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>
        </motion.div>
      </section>

      {/* ═══════════════ 2. INVARIANTES — full-bleed editorial rows ═══════════════ */}
      <Section>
        <Reveal>
          <SectionHead
            eyebrow="Ingeniería sistemática"
            title="Invariantes de diseño."
            accent="Cero alucinaciones financieras."
            sub="Tres fronteras innegociables separan la predicción estadística de la ejecución autónoma. Ninguna orden existe sin cruzarlas."
          />
        </Reveal>

        {/* Monumental real IC exhibit — asymmetric split */}
        {evaluation && (
          <Reveal delay={0.1}>
            <div className="mt-14 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#636366]">
                  Mean Information Coefficient · N = {evaluation.n_days.toLocaleString('en-US')} días
                </div>
                <div className="tnum titanium-text-gradient mt-2 font-mono text-[4.5rem] font-extrabold leading-none tracking-tighter sm:text-[7rem]">
                  +{evaluation.mean_ic.toFixed(4)}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/[0.07] pt-4 font-mono text-xs text-[#86868B]">
                  <span>
                    ICIR <strong className="text-white">+{evaluation.icir.toFixed(3)}</strong>
                  </span>
                  <span>
                    Hit-Rate Top-K{' '}
                    <strong className="text-white">
                      {(evaluation.hit_rate_topk * 100).toFixed(1)}%
                    </strong>
                  </span>
                  <span>
                    Gate{' '}
                    <strong className={evaluation.passed ? 'text-[#30D158]' : 'text-[#FF453A]'}>
                      {evaluation.passed ? 'PASS' : 'FAIL'}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="border-l border-white/[0.07] pl-6 lg:col-span-5">
                <p className="text-sm leading-relaxed text-[#A1A1A6]">
                  El agente autónomo tiene prohibido emitir órdenes si el modelo no demuestra
                  correlación de rango positiva en ventanas walk-forward. La autorización se evalúa
                  sobre el retorno posterior a la señal para impedir fuga de información:
                </p>
                <div className="mt-4 rounded-lg border-l-2 border-white/25 bg-white/[0.02] px-4 py-3 font-mono text-[11px] text-white">
                  IC = SpearmanCorr(score_t, r_t+1..t+2) ≥ umbral
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Invariant rows — hairline list, not boxes */}
        <div className="mt-16 border-t border-white/[0.07]">
          {invariants.map((inv, i) => (
            <Reveal key={inv.n} delay={i * 0.08}>
              <div className="group grid grid-cols-1 items-baseline gap-2 border-b border-white/[0.07] py-8 transition-colors hover:bg-white/[0.015] md:grid-cols-12 md:gap-6 md:px-4">
                <div className="font-mono text-xs text-[#48484A] md:col-span-1">{inv.n}</div>
                <h3 className="text-xl font-bold tracking-tight text-white md:col-span-3">
                  {inv.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#86868B] md:col-span-6">{inv.desc}</p>
                <div
                  className={cn(
                    'font-mono text-[10px] uppercase tracking-[0.16em] md:col-span-2 md:text-right',
                    inv.tagTone ?? 'text-[#636366]'
                  )}
                >
                  {inv.tag}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══════════════ 3. INTERACTIVE SIMULATOR ═══════════════ */}
      <Section>
        <InteractiveSimulator onNavigateToTab={onNavigateToTab} />
      </Section>

      {/* ═══════════════ 4. BLOOMBERG MEDIA DESK — one narrative, one CTA ═══════════════ */}
      <Section>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <Eyebrow>
              <span className="flex items-center gap-2">
                <StatusDot tone="neg" ping /> Bloomberg Pulse · 24/7
              </span>
            </Eyebrow>
            <h2 className="mt-4 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
              La pulsación macro global, <em className="italic text-[#6E6E73]">en tu terminal.</em>
            </h2>
            <p className="editorial-subhead mt-5 max-w-md text-sm leading-relaxed text-[#86868B]">
              Televisión oficial en directo, podcast diario de Bloomberg Línea, wire RSS certificado
              y widgets institucionales de mercado. Todo el desk macro concentrado en una sola
              pestaña operativa.
            </p>
            <Btn className="mt-8" size="lg" onClick={() => onNavigateToTab('bloomberg')}>
              <span>Abrir Terminal Bloomberg</span>
              <ArrowRight className="h-4 w-4" />
            </Btn>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-7">
            <div className="border-t border-white/[0.07]">
              {mediaCapabilities.map((cap) => {
                const Icon = cap.icon
                return (
                  <button
                    key={cap.n}
                    onClick={() => onNavigateToTab('bloomberg')}
                    className="group flex w-full items-center gap-5 border-b border-white/[0.07] px-2 py-5 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    <span className="font-mono text-[10px] text-[#48484A]">{cap.n}</span>
                    <Icon className="h-4 w-4 shrink-0 text-[#636366] transition-colors group-hover:text-white" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold tracking-tight text-white">
                        {cap.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-[#86868B]">
                        {cap.desc}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 -translate-x-1 text-[#48484A] opacity-0 transition-all group-hover:translate-x-0 group-hover:text-white group-hover:opacity-100" />
                  </button>
                )
              })}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ═══════════════ 5. COMPARISON MATRIX ═══════════════ */}
      <Section>
        <ComparisonMatrix />
      </Section>

      {/* ═══════════════ 6. AUDITED TRACK RECORD ═══════════════ */}
      <Section>
        <TrackRecordShowcase />
      </Section>

      {/* ═══════════════ 7. CRYPTOGRAPHIC VAULT PROOF ═══════════════ */}
      <Section>
        <SecurityVaultProof />
      </Section>

      {/* ═══════════════ 8. FINAL CTA — single action, no conflicts ═══════════════ */}
      <section className="relative overflow-hidden border-t border-white/[0.07] py-24 text-center sm:py-32">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[140px]"
          aria-hidden
        />
        <Reveal>
          <div className="relative mx-auto max-w-3xl space-y-7 px-4">
            <Eyebrow className="justify-center" rule={false}>
              <Lock className="h-3 w-3" /> Soberanía de código · Alibaba ECS + local
            </Eyebrow>
            <h2 className="font-serif text-4xl leading-[1.05] text-white sm:text-6xl">
              Despliega tu mesa cuantitativa <em className="italic text-[#6E6E73]">institucional.</em>
            </h2>
            <p className="editorial-subhead mx-auto max-w-xl text-sm leading-relaxed text-[#86868B]">
              Sin suscripciones opacas. Servidor FastAPI nativo con trazabilidad total: cada señal,
              cada orden y cada retorno liquidado queda sellado y auditado.
            </p>
            <div className="flex justify-center pt-2">
              <Btn size="lg" onClick={() => onNavigateToTab('overview')} className="shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)]">
                <ShieldCheck className="h-4 w-4" />
                <span>Entrar al terminal en vivo</span>
              </Btn>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

/* Loading state for console panels awaiting telemetry */
const ConsoleEmpty: React.FC = () => (
  <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center">
    <motion.div
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.8, repeat: Infinity }}
      className="h-1.5 w-1.5 rounded-full bg-white"
    />
    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#636366]">
      Sincronizando telemetría…
    </span>
  </div>
)
