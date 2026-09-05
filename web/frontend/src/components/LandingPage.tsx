import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Terminal,
  Layers,
  Lock,
  ChevronRight,
  Activity,
  Globe,
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
  const dynamicPhrases = [
    'Factor Mining con 158 Alphas de Microsoft Qlib',
    'Gate Matemático Infranqueable (IC ≥ 0.05, ICIR ≥ 0.50)',
    'Construcción de Portafolio Autónoma mediante Agente LLM',
    'Bóveda Criptográfica con Sellado SHA-256 Inmutable',
    'Aislamiento Estricto Zero-Import entre Qlib y Vibe',
    'Doble Blindaje de Ejecución (--submit + VIBE_ALLOW_ORDERS)',
  ]

  const liveTickers = [
    { ticker: 'NVDA', score: '+0.942', change: '+4.8%', bullish: true },
    { ticker: 'AAPL', score: '+0.881', change: '+1.2%', bullish: true },
    { ticker: 'MSFT', score: '+0.814', change: '+2.1%', bullish: true },
    { ticker: 'TSLA', score: '-0.312', change: '-0.8%', bullish: false },
    { ticker: 'AMD', score: '+0.765', change: '+3.4%', bullish: true },
    { ticker: 'GOOGL', score: '+0.729', change: '+1.9%', bullish: true },
  ]

  return (
    <div className="w-full flex flex-col space-y-24 py-4 sm:py-8">
      {/* 1. HERO SECTION (Apple iPhone 17 Pro Launch Style) */}
      <section className="relative w-full flex flex-col items-center text-center pt-10 pb-16 overflow-hidden">
        {/* Apple Atmospheric White Rim Halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-white/[0.03] blur-[160px] pointer-events-none" />

        {/* Dynamic Tagline Swap */}
        <div className="mb-6">
          <TextSwap phrases={dynamicPhrases} intervalMs={3600} />
        </div>

        {/* Kinetic Title (Apple Titanium Metallic Specular Effect) */}
        <div className="max-w-4xl mx-auto px-4">
          <KineticTitle
            text="Donde el Rigor Cuantitativo Institucional Conoce la Autonomía Agéntica"
            highlightWord="Agéntica"
            className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.03] tracking-[-0.04em]"
          />
        </div>

        {/* Editorial Subtitle */}
        <p className="max-w-2xl mx-auto mt-6 text-base sm:text-lg text-[#86868B] font-sans leading-relaxed px-4 tracking-tight">
          QuantVibe orquesta el pipeline completo de trading sistemático: minado de 158 factores con
          Microsoft Qlib, validación con firewall matemático ineludible (Gate IC ≥ 0.05), y ejecución de órdenes
          mediante agentes autónomos sellados bajo digest criptográfico SHA-256.
        </p>

        {/* Primary CTA Buttons (Apple Store Pure White & Frosted Pill) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 px-4 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigateToTab('overview')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm tracking-tight shadow-xl hover:bg-[#E8E8ED] flex items-center justify-center space-x-2 apple-press group"
          >
            <span>Explorar Alpha Studio</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigateToTab('pipeline')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/[0.14] text-[#F5F5F7] font-medium text-sm tracking-tight shadow-md flex items-center justify-center space-x-2 apple-press transition-colors"
          >
            <Terminal className="w-4 h-4 text-white" />
            <span>Lanzar Pipeline en Vivo</span>
          </motion.button>
        </div>

        {/* Live Ticker Telemetry Strip (Apple Watch / Stocks Precision) */}
        <div className="w-full max-w-5xl mt-14 px-4">
          <div className="p-3 rounded-2xl bg-[#0D0D11] border border-white/[0.08] backdrop-blur-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#D2D2D7] pl-2">
              <Activity className="w-3.5 h-3.5 text-white" />
              <span className="font-semibold tracking-tight">LIVE TELEMETRY:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
              {liveTickers.map((t) => (
                <div
                  key={t.ticker}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#141418] border border-white/[0.06]"
                >
                  <span className="font-bold text-white">{t.ticker}</span>
                  <span className="text-[11px] text-[#86868B]">{t.score}</span>
                  <span className={t.bullish ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                    {t.change}
                  </span>
                </div>
              ))}
            </div>

            <div className="hidden lg:flex items-center space-x-2 pr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono text-[#86868B]">Gate IC: 0.0824 Validado</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE THREE INVARIANT PILLARS (Apple Bento Grid) */}
      <section className="w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-[#86868B] font-medium block mb-2">
            ARQUITECTURA DE TRES PILARES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight editorial-display">
            Invariantes de Ingeniería Cuantitativa
          </h2>
          <p className="text-[#86868B] text-sm mt-3 leading-relaxed">
            Diseñado desde los cimientos para impedir alucinaciones financieras y garantizar la supervivencia del capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-8 rounded-3xl bg-[#0C0C10] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group hover:border-white/25 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-[#141418] border border-white/[0.12] flex items-center justify-center text-white mb-6">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-medium text-[#86868B] uppercase tracking-wider">
              Pilar I
            </span>
            <h3 className="text-xl font-bold text-white mt-1 mb-3 tracking-tight">
              Cerebro Cuantitativo Qlib
            </h3>
            <p className="text-sm text-[#86868B] leading-relaxed">
              Cálculo distribuido de 158 factores Alpha continuos y entrenamiento de árboles gradient-boosted
              con LightGBM sobre ventanas móviles walk-forward. Cero intuiciones no probadas.
            </p>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#86868B]">
              <span>Alpha158 Dataset</span>
              <span className="text-white">LightGBM Model</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-3xl bg-[#0C0C10] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group hover:border-white/25 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-[#141418] border border-white/[0.12] flex items-center justify-center text-white mb-6">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-mono font-medium text-emerald-400 uppercase tracking-wider">
              Pilar II
            </span>
            <h3 className="text-xl font-bold text-white mt-1 mb-3 tracking-tight">
              Firewall Estadístico (Gate IC)
            </h3>
            <p className="text-sm text-[#86868B] leading-relaxed">
              Filtro implacable previo a cualquier orden: Information Coefficient (IC) ≥ 0.05 e ICIR ≥ 0.50.
              Si el modelo sufre de degradación de señal, el sistema aborta de inmediato.
            </p>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#86868B]">
              <span>IC Threshold ≥ 0.05</span>
              <span className="text-emerald-400">Fail-Safe Automático</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-3xl bg-[#0C0C10] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group hover:border-white/25 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-[#141418] border border-white/[0.12] flex items-center justify-center text-white mb-6">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-medium text-[#86868B] uppercase tracking-wider">
              Pilar III
            </span>
            <h3 className="text-xl font-bold text-white mt-1 mb-3 tracking-tight">
              Manos Agénticas de Ejecución
            </h3>
            <p className="text-sm text-[#86868B] leading-relaxed">
              El agente Vibe optimiza el tamaño de orden y balance de liquidez respetando invariantes matemáticos:
              máximo 20% por posición, doble guardia de confirmación y registro en SQLite inmutable.
            </p>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#86868B]">
              <span>Max Weight 20.0%</span>
              <span className="text-white">Doble Guard (--submit)</span>
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

      {/* 7. INSTITUTIONAL SPECIFICATION CALLOUT (Apple Checkout & Deployment Banner) */}
      <section className="w-full rounded-3xl bg-[#0C0C10] border border-white/[0.1] p-8 sm:p-14 relative overflow-hidden text-center">
        {/* Top subtle border sheen */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-[#A1A1A6] text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-white" />
            <span>LISTO PARA GITHUB CODESPACES & SERVIDOR PRIVADO</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight editorial-display">
            Despliega tu Mesa Cuantitativa Institucional en Minutos
          </h2>

          <p className="text-[#86868B] text-sm sm:text-base leading-relaxed">
            Sin suscripciones opacas ni dependencias en la nube ajena. QuantVibe corre en un único proceso
            FastAPI + React optimizado para GitHub Codespaces (`0.0.0.0:8000`) o infraestructura privada con
            acceso completo al código y trazabilidad en grafos de conocimiento.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigateToTab('overview')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm tracking-tight shadow-xl hover:bg-[#E8E8ED] flex items-center justify-center space-x-2 apple-press"
            >
              <span>Abrir Alpha Studio en Vivo</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigateToTab('execution')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/[0.14] text-white font-medium text-sm tracking-tight flex items-center justify-center space-x-2 apple-press transition-colors"
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
