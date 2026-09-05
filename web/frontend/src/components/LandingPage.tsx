import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Lock,
  ChevronRight,
  Globe,
  CheckCircle2,
  Fingerprint,
} from 'lucide-react'
import { KineticTitle } from './landing/KineticTitle'
import { TextSwap } from './landing/TextSwap'
import { InteractiveSimulator } from './landing/InteractiveSimulator'
import { ComparisonMatrix } from './landing/ComparisonMatrix'
import { SecurityVaultProof } from './landing/SecurityVaultProof'
import { TrackRecordShowcase } from './landing/TrackRecordShowcase'

interface LandingPageProps {
  onNavigateToTab: (tab: string) => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToTab }) => {
  const [consoleTab, setConsoleTab] = useState<'signals' | 'gate' | 'crypto'>('signals')

  const dynamicPhrases = [
    'Factor Mining con 158 Alphas de Microsoft Qlib',
    'Gate Matemático Infranqueable (Mean IC ≥ 0.00, ICIR ≥ 0.00)',
    'Construcción de Portafolio Autónoma mediante Agente LLM',
    'Bóveda Criptográfica con Sellado SHA-256 Inmutable',
    'Aislamiento Estricto Zero-Import entre Qlib y Vibe',
    'Doble Blindaje de Ejecución (--submit + VIBE_ALLOW_ORDERS)',
  ]

  const liveTickers = [
    { ticker: 'TSLA', score: '+0.128', rank: '#1', weight: '20.0%', action: 'BUY' },
    { ticker: 'AAPL', score: '+0.101', rank: '#2', weight: '20.0%', action: 'BUY' },
    { ticker: 'META', score: '+0.084', rank: '#3', weight: '20.0%', action: 'BUY' },
    { ticker: 'JPM', score: '+0.054', rank: '#4', weight: '20.0%', action: 'BUY' },
    { ticker: 'NVDA', score: '+0.047', rank: '#5', weight: '20.0%', action: 'BUY' },
  ]

  return (
    <div className="w-full flex flex-col space-y-32 py-6 sm:py-12 relative overflow-hidden">
      {/* 1. HERO SECTION (Apple iPhone Pro Flagship Launch Style) */}
      <section className="relative w-full flex flex-col items-center text-center pt-8 pb-12 overflow-hidden">
        {/* Apple Atmospheric White Rim Halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-gradient-to-b from-white/[0.045] via-white/[0.015] to-transparent blur-[160px] pointer-events-none -z-10" />

        {/* Asymmetric Luxury Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-[#0E0E12]/90 border border-white/[0.12] backdrop-blur-2xl shadow-xl mb-8 group hover:border-white/30 transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#A1A1A6] font-medium">
            QUANTITATIVE BRAIN × AUTONOMOUS HANDS
          </span>
          <span className="h-3 w-[1px] bg-white/[0.15]" />
          <span className="text-[11px] font-mono text-white/90 font-semibold flex items-center gap-1">
            <span>PRO</span>
            <span className="text-[#86868B]">v1.0.1</span>
          </span>
        </motion.div>

        {/* Dynamic Tagline Swap */}
        <div className="mb-6">
          <TextSwap phrases={dynamicPhrases} intervalMs={3400} />
        </div>

        {/* Monumental Typographic Headline (Luxury Editorial + Geometric Sans) */}
        <div className="max-w-6xl mx-auto px-4">
          <KineticTitle
            text="Donde el Rigor Cuantitativo Institucional Conoce la Autonomía Agéntica"
            highlightWord="Cuantitativo"
            italicWord="Agéntica"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.0] tracking-[-0.045em]"
          />
        </div>

        {/* Editorial Subtitle with Calculated Optical Measure */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto mt-7 text-base sm:text-lg text-[#86868B] font-sans leading-relaxed px-4 tracking-[-0.015em] font-normal"
        >
          QuantVibe orquesta el pipeline completo de finanzas computacionales: minado de 158 factores con{' '}
          <strong className="text-[#F5F5F7] font-medium">Microsoft Qlib</strong>, validación con firewall matemático ineludible{' '}
          (<span className="text-white font-mono text-sm font-semibold">IC ≥ 0.00</span>), y ejecución autónoma mediante agentes LLM protegidos bajo digest criptográfico{' '}
          <span className="text-white font-mono text-sm font-semibold">SHA-256</span>.
        </motion.p>

        {/* Primary CTA Action System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 px-4 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigateToTab('overview')}
            className="w-full sm:w-auto px-9 py-4 rounded-full bg-white text-black font-semibold text-sm tracking-tight shadow-[0_0_50px_rgba(255,255,255,0.25)] hover:bg-[#EAEAEA] flex items-center justify-center space-x-2.5 transition-all group"
          >
            <span>Explorar Alpha Studio</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigateToTab('bloomberg')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#121216]/90 hover:bg-[#1C1C22] border border-white/[0.14] text-[#F5F5F7] font-medium text-sm tracking-tight shadow-lg flex items-center justify-center space-x-2.5 transition-colors backdrop-blur-xl"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Terminal Bloomberg en Vivo</span>
          </motion.button>
        </motion.div>

        {/* ======================================================================= */}
        {/* FLAGSHIP 3D PERSPECTIVE TERMINAL CONSOLE (Apple Keynote Reveal Object)   */}
        {/* ======================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 45, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-7xl mt-16 px-2 sm:px-4"
        >
          <div className="relative rounded-3xl bg-[#08080C]/90 border border-white/[0.12] p-1.5 sm:p-2 shadow-[0_30px_90px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-3xl overflow-hidden">
            {/* Specular Glare Strip */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Terminal Top Chrome Bar */}
            <div className="px-4 py-3 border-b border-white/[0.07] bg-[#0C0C10]/70 rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/[0.18]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                </div>
                <span className="text-xs font-mono text-[#86868B] tracking-tight">
                  quantvibe-terminal // node: alibaba-ecs-production
                </span>
              </div>

              {/* Interactive Console Navigation Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/[0.08]">
                <button
                  onClick={() => setConsoleTab('signals')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    consoleTab === 'signals'
                      ? 'bg-white/15 text-white font-semibold shadow-sm'
                      : 'text-[#86868B] hover:text-white'
                  }`}
                >
                  01. TOP SEÑALES
                </button>
                <button
                  onClick={() => setConsoleTab('gate')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    consoleTab === 'gate'
                      ? 'bg-white/15 text-white font-semibold shadow-sm'
                      : 'text-[#86868B] hover:text-white'
                  }`}
                >
                  02. GATE DE SEGURIDAD
                </button>
                <button
                  onClick={() => setConsoleTab('crypto')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    consoleTab === 'crypto'
                      ? 'bg-white/15 text-white font-semibold shadow-sm'
                      : 'text-[#86868B] hover:text-white'
                  }`}
                >
                  03. FIRMA SHA-256
                </button>
              </div>

              <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE 200 OK</span>
              </div>
            </div>

            {/* Terminal Interactive Stage */}
            <div className="p-4 sm:p-8 bg-[#050508]/80 min-h-[300px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {consoleTab === 'signals' && (
                  <motion.div
                    key="signals"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
                  >
                    {liveTickers.map((t) => (
                      <div
                        key={t.ticker}
                        className="p-4 rounded-2xl bg-[#0E0E14] border border-white/[0.08] hover:border-white/25 transition-all text-left flex flex-col justify-between group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-white font-sans tracking-tight">
                            {t.ticker}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-[#D2D2D7]">
                            {t.rank}
                          </span>
                        </div>
                        <div className="space-y-1 font-mono text-xs">
                          <div className="flex justify-between text-[#86868B]">
                            <span>Alpha Score</span>
                            <span className="text-white font-medium">{t.score}</span>
                          </div>
                          <div className="flex justify-between text-[#86868B]">
                            <span>Ponderación</span>
                            <span className="text-[#D2D2D7]">{t.weight}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            {t.action}
                          </span>
                          <span className="text-[10px] font-mono text-[#71717A]">STAGED</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {consoleTab === 'gate' && (
                  <motion.div
                    key="gate"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
                  >
                    <div className="p-5 rounded-2xl bg-[#0E0E14] border border-white/[0.08]">
                      <div className="text-xs font-mono text-[#86868B] mb-1">CORRELACIÓN DE SPEARMAN (IC)</div>
                      <div className="text-3xl font-extrabold text-white font-mono tracking-tight">+0.0681</div>
                      <div className="text-xs text-emerald-400 font-mono mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Umbral superado (≥ 0.000)</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0E0E14] border border-white/[0.08]">
                      <div className="text-xs font-mono text-[#86868B] mb-1">RATIO DE INFORMACIÓN (ICIR)</div>
                      <div className="text-3xl font-extrabold text-white font-mono tracking-tight">+0.2035</div>
                      <div className="text-xs text-emerald-400 font-mono mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Estabilidad de señal probada</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0E0E14] border border-white/[0.08]">
                      <div className="text-xs font-mono text-[#86868B] mb-1">TOP-K HIT RATE & RETORNO</div>
                      <div className="text-3xl font-extrabold text-white font-mono tracking-tight">57.1%</div>
                      <div className="text-xs text-[#A1A1A6] font-mono mt-2">
                        Retorno medio +0.118% vs universo +0.031%
                      </div>
                    </div>
                  </motion.div>
                )}

                {consoleTab === 'crypto' && (
                  <motion.div
                    key="crypto"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="p-6 rounded-2xl bg-[#0E0E14] border border-white/[0.08] text-left space-y-4 font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-[#86868B]">
                        <Fingerprint className="w-4 h-4 text-white" />
                        <span>CANONICAL SHA-256 INTEGRITY DIGEST</span>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        CRYPTOGRAPHICALLY VERIFIED
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] text-xs text-[#E5E5EA] break-all select-all">
                      1154c789fed7e23cabf14f413561c4425ebe01e9c6d0311836c08d77a4bb0715
                    </div>

                    <div className="text-xs text-[#86868B] flex flex-wrap gap-4 pt-1">
                      <span>• Schema: v1.0.0 Validated</span>
                      <span>• Contiguous Ranks: Verified 1..5</span>
                      <span>• Nonce & As-Of: 2026-09-04</span>
                      <span>• Agent Barrier: Zero-Import Enforced</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ASYMMETRICAL ARCHITECTURAL EXHIBITS (Breaking the box grid)             */}
      {/* ========================================================================= */}
      <section className="w-full space-y-20">
        {/* Section Lead Editorial */}
        <div className="max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#86868B] font-medium block mb-3">
            INGENIERÍA SISTEMÁTICA
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-[-0.035em] leading-[1.05]">
            Invariantes de Diseño.<br />
            <span className="text-[#86868B]">Cero Alucinaciones Financieras.</span>
          </h2>
        </div>

        {/* EXHIBIT A: The Statistical Firewall (Split Monument Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Monumental Typographic Exhibit (7 cols) */}
          <div className="lg:col-span-7 relative p-8 sm:p-14 rounded-3xl bg-[#09090D] border border-white/[0.08] overflow-hidden">
            {/* Hairline Technical Crosshairs */}
            <div className="absolute top-4 left-4 text-white/20 font-mono text-xs">+</div>
            <div className="absolute top-4 right-4 text-white/20 font-mono text-xs">+</div>
            <div className="absolute bottom-4 left-4 text-white/20 font-mono text-xs">+</div>
            <div className="absolute bottom-4 right-4 text-white/20 font-mono text-xs">+</div>

            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs font-mono text-[#D2D2D7]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>INVARIANTE I • GATE DE BACKTEST INFRANQUEABLE</span>
              </div>

              <div className="space-y-1">
                <div className="text-6xl sm:text-8xl md:text-9xl font-extrabold text-white font-mono tracking-tighter leading-none">
                  +0.068
                </div>
                <div className="text-sm font-mono text-[#86868B] tracking-tight">
                  MEAN INFORMATION COEFFICIENT (IC) // N = 1,459 DÍAS
                </div>
              </div>

              <p className="text-[#A1A1A6] text-sm sm:text-base leading-relaxed max-w-xl font-sans">
                El agente autónomo tiene prohibido emitir órdenes si el modelo de machine learning no demuestra correlación de rango positiva comprobable en ventanas walk-forward. Si el IC cae por debajo del umbral, la puerta se cierra automáticamente.
              </p>

              <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="text-[#86868B]">ICIR (ESTABILIDAD)</div>
                  <div className="text-lg font-bold text-white">+0.2035</div>
                </div>
                <div>
                  <div className="text-[#86868B]">HIT RATE TOP-K</div>
                  <div className="text-lg font-bold text-white">57.1%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Floating Explanatory Narrative (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-7 rounded-3xl bg-[#0E0E14]/80 border border-white/[0.08] backdrop-blur-xl space-y-4">
              <span className="text-xs font-mono text-[#86868B] uppercase">Fórmula de Autorización</span>
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] font-mono text-xs text-white">
                IC = SpearmanCorr(score_t, (P_t+2 / P_t+1) - 1) ≥ 0.00
              </div>
              <p className="text-xs text-[#86868B] leading-relaxed">
                Evaluado rigurosamente sobre el retorno a dos días posteriores a la señal para garantizar que no haya fuga de información (lookahead bias).
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0E0E14]/80 border border-white/[0.08] backdrop-blur-xl space-y-3">
              <span className="text-xs font-mono text-[#86868B] uppercase">Aislamiento de Entornos</span>
              <h4 className="text-lg font-bold text-white">Zero-Import Architecture</h4>
              <p className="text-xs text-[#86868B] leading-relaxed">
                Qlib (entorno de investigación) y Vibe-Trading (entorno de ejecución) operan en procesos aislados. Nunca importan código mutuo. La única vía de comunicación es el contrato firmado SHA-256 y el protocolo FastMCP.
              </p>
            </div>
          </div>
        </div>

        {/* EXHIBIT B: The Three Foundation Pillars in Staggered Asymmetry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-[#09090D] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white mb-6">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-[#86868B] block mb-2">01 // INVESTIGACIÓN</span>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Cerebro Cuantitativo Qlib
              </h3>
              <p className="text-sm text-[#86868B] leading-relaxed">
                Cálculo distribuido de 158 factores Alpha continuos y entrenamiento de árboles gradient-boosted con LightGBM sobre ventanas móviles walk-forward.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#86868B]">
              <span>Dataset Alpha158</span>
              <span className="text-white">LGBModel</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#09090D] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-emerald-400 mb-6">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-emerald-400 block mb-2">02 // VERIFICACIÓN</span>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Firewall Matemático (Gate)
              </h3>
              <p className="text-sm text-[#86868B] leading-relaxed">
                Filtro implacable previo a cualquier orden: IC ≥ 0.00 e ICIR ≥ 0.00. Si el modelo sufre de degradación de señal, el sistema aborta de inmediato.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#86868B]">
              <span>Filtro IC</span>
              <span className="text-emerald-400 font-semibold">Fail-Safe Activo</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#09090D] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white mb-6">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-[#86868B] block mb-2">03 // EJECUCIÓN</span>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Manos Agénticas Vibe
              </h3>
              <p className="text-sm text-[#86868B] leading-relaxed">
                El agente optimiza el tamaño de orden y balance de liquidez respetando invariantes: máximo 20% por posición, doble confirmación y registro en SQLite.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#86868B]">
              <span>Max Cap 20%</span>
              <span className="text-white">Doble Guardia</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE SIMULATOR */}
      <section className="w-full">
        <InteractiveSimulator onNavigateToTab={onNavigateToTab} />
      </section>

      {/* 4. INSTITUTIONAL COMPARISON MATRIX */}
      <section className="w-full">
        <ComparisonMatrix />
      </section>

      {/* 5. AUDITED HISTORICAL TRACK RECORD */}
      <section className="w-full">
        <TrackRecordShowcase />
      </section>

      {/* 6. CRYPTOGRAPHIC VAULT & ZERO-IMPORT PROOF */}
      <section className="w-full">
        <SecurityVaultProof />
      </section>

      {/* ========================================================================= */}
      {/* 7. MONUMENTAL PRODUCTION DEPLOYMENT CALLOUT                               */}
      {/* ========================================================================= */}
      <section className="w-full rounded-3xl bg-[#08080C] border border-white/[0.1] p-10 sm:p-16 relative overflow-hidden text-center shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-[#A1A1A6] text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-white" />
            <span>DESPLIEGUE CLOUD PRIVADO // ALIBABA ECS + LOCAL</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-[-0.04em]">
            Despliega tu Mesa Cuantitativa Institucional
          </h2>

          <p className="text-[#86868B] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-sans font-normal">
            Sin suscripciones opacas ni dependencias en la nube ajena. QuantVibe opera con soberanía de código:
            servidor FastAPI nativo en puerto 8000/80 con trazabilidad total en grafos de conocimiento.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigateToTab('overview')}
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-white text-black font-semibold text-sm tracking-tight shadow-xl hover:bg-[#EAEAEA] flex items-center justify-center space-x-2"
            >
              <span>Abrir Alpha Studio en Vivo</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigateToTab('execution')}
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#14141A] hover:bg-[#202028] border border-white/[0.14] text-white font-medium text-sm tracking-tight flex items-center justify-center space-x-2 transition-colors"
            >
              <Lock className="w-4 h-4 text-[#A1A1A6]" />
              <span>Inspeccionar Mesa de Órdenes</span>
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  )
}
