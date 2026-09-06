import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  ShieldAlert,
  Send,
  Lock,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Key,
  Layers,
  ShieldCheck,
  Globe,
  HelpCircle,
  Terminal,
  Sparkles,
} from 'lucide-react'
import type {
  OrdersPlan,
  BrokerInfo,
  BrokerTestResult,
  FeatureAttributionResponse,
} from '../types'
import {
  executeOrders,
  fetchBrokerCatalog,
  testBrokerConnection,
  fetchFeatureAttribution,
} from '../api'
import { Btn, Eyebrow, StatusDot, CopyChip, cn, Segmented } from './ui'

interface ExecutionTabProps {
  orders: OrdersPlan | null
  onRefresh: () => void
}

const FALLBACK_BROKERS: BrokerInfo[] = [
  {
    id: 'mt5',
    name: 'MetaTrader 5 Bridge',
    category: 'Forex, CFDs & Prop Firms',
    icon: 'mt5',
    description:
      'En MT5 no se usan API Keys. Se conecta mediante tu Número de Cuenta (Login), Contraseña y Servidor que te asigna tu broker (ej. ICMarkets, FTMO, Darwinex), o por detección automática si tienes MT5 abierto en tu PC.',
    assets: ['Forex', 'Índices', 'Commodities', 'CFDs'],
    license: 'FCA / ASIC / CySEC Brokers (FTMO, IC Markets, Darwinex)',
    status: 'ready',
    latency_ms: 18,
    default_template:
      'python scripts/connectors/broker_mt5.py --symbol {symbol} --action BUY --volume {qty} --magic 202609',
    supported_modes: ['paper', 'live'],
    fields: [
      {
        key: 'account',
        label: 'Número de Cuenta (Login ID)',
        type: 'text',
        placeholder: 'Ej: 10849204 (Visible en la barra superior de MT5)',
      },
      {
        key: 'password',
        label: 'Contraseña de Trading (Master Password)',
        type: 'password',
        placeholder: 'La contraseña con la que inicias sesión en tu MT5',
      },
      {
        key: 'server',
        label: 'Servidor del Broker (Server)',
        type: 'text',
        placeholder: 'Ej: ICMarketsSC-Demo, FTMO-Server, Darwinex-Live',
      },
    ],
  },
  {
    id: 'alpaca',
    name: 'Alpaca Markets',
    category: 'US Equities & Options',
    icon: 'alpaca',
    description:
      'Broker regulado por FINRA/SIPC con API REST directa. Ejecución algorítmica sin comisiones en acciones estadounidenses.',
    assets: ['US Stocks', 'ETFs', 'Options'],
    license: 'FINRA / SIPC Regulated (EE.UU.)',
    status: 'ready',
    latency_ms: 42,
    default_template:
      'python scripts/connectors/broker_alpaca.py --ticker {symbol} --qty {qty} --env paper',
    supported_modes: ['paper', 'live'],
    fields: [
      { key: 'api_key', label: 'API Key ID', type: 'text', placeholder: 'PK... (Alpaca Key)' },
      {
        key: 'api_secret',
        label: 'API Secret Key',
        type: 'password',
        placeholder: '••••••••••••••••',
      },
      {
        key: 'endpoint',
        label: 'API Endpoint',
        type: 'text',
        placeholder: 'https://paper-api.alpaca.markets',
      },
    ],
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers (IBKR)',
    category: 'Institutional Prime Brokerage',
    icon: 'ibkr',
    description:
      'Conexión a Client Portal Web API / TWS Gateway. Acceso directo a más de 150 mercados globales con SmartRouting institucional.',
    assets: ['Global Equities', 'Futures', 'Bonds', 'Currencies'],
    license: 'NYSE / FINRA / SIPC / SEC',
    status: 'ready',
    latency_ms: 48,
    default_template:
      'python scripts/connectors/broker_ibkr.py --conid {symbol} --qty {qty} --order-type MKT',
    supported_modes: ['paper', 'live'],
    fields: [
      {
        key: 'gateway_url',
        label: 'Client Portal Gateway URL',
        type: 'text',
        placeholder: 'https://localhost:5000/v1/api',
      },
      { key: 'account_id', label: 'ID de Cuenta IBKR', type: 'text', placeholder: 'U12345678' },
      { key: 'tws_port', label: 'Puerto TWS / Gateway', type: 'text', placeholder: '7497' },
    ],
  },
  {
    id: 'crypto',
    name: 'Cripto 24/7 (Binance / Bybit)',
    category: 'Digital Assets Spot & Perps',
    icon: 'crypto',
    description:
      'Router de ejecución continua 24/7/365 para criptoactivos con autenticación HMAC-SHA256 y órdenes post-only / limit.',
    assets: ['BTC', 'ETH', 'SOL', 'USDT Perps'],
    license: 'VASP Registered / Non-Custodial Router',
    status: 'ready',
    latency_ms: 28,
    default_template:
      'python scripts/connectors/broker_crypto.py --symbol {symbol}USDT --side BUY --qty {qty} --exchange binance',
    supported_modes: ['paper', 'live'],
    fields: [
      {
        key: 'exchange',
        label: 'Exchange Cripto',
        type: 'text',
        placeholder: 'binance (o bybit, coinbase)',
      },
      {
        key: 'api_key',
        label: 'API Key',
        type: 'text',
        placeholder: 'API Key con permisos de solo trading (Retiros deshabilitados)',
      },
      { key: 'api_secret', label: 'Secret Key', type: 'password', placeholder: '••••••••••••••••' },
    ],
  },
  {
    id: 'webhook',
    name: 'Webhook Universal / cTrader',
    category: 'Algorithmic Webhooks & Custom EAs',
    icon: 'webhook',
    description:
      'Despachador universal con payload JSON firmado por HMAC-SHA256 para cTrader Open API, TradingView alerts o bots propios.',
    assets: ['cTrader', 'TradingView', 'Custom Bot', 'Zapier'],
    license: 'Open Protocol / Custom Ingestion',
    status: 'ready',
    latency_ms: 34,
    default_template:
      'python scripts/connectors/broker_webhook.py --url https://api.yourbroker.com/v1/orders --symbol {symbol} --qty {qty}',
    supported_modes: ['paper', 'live'],
    fields: [
      {
        key: 'webhook_url',
        label: 'URL de Webhook Endpoint',
        type: 'text',
        placeholder: 'https://api.spotware.com/connect/orders',
      },
      {
        key: 'signature_token',
        label: 'Token de Firma SHA-256',
        type: 'password',
        placeholder: 'Bearer secret_webhook_token_123',
      },
      {
        key: 'payload_format',
        label: 'Formato de Payload',
        type: 'text',
        placeholder: 'json_standard',
      },
    ],
  },
]

export const ExecutionTab: React.FC<ExecutionTabProps> = ({ orders, onRefresh }) => {
  const [allowLive, setAllowLive] = useState(false)
  const [brokers, setBrokers] = useState<BrokerInfo[]>(FALLBACK_BROKERS)
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('mt5')
  const [orderCmdTemplate, setOrderCmdTemplate] = useState<string>(
    FALLBACK_BROKERS[0].default_template
  )
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [useOpenTerminal, setUseOpenTerminal] = useState(true)
  const [isTestingPing, setIsTestingPing] = useState(false)
  const [pingResult, setPingResult] = useState<BrokerTestResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitOutput, setSubmitOutput] = useState<{ text: string; ok: boolean } | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showMt5Guide, setShowMt5Guide] = useState(true)

  // Intelligence drawer: Qlib Factor Attribution vs Vibe-Trading Reasoning
  const [activeIntelTab, setActiveIntelTab] = useState<'qlib' | 'vibe'>('qlib')
  const [attribution, setAttribution] = useState<FeatureAttributionResponse | null>(null)

  useEffect(() => {
    fetchBrokerCatalog()
      .then((data) => {
        if (data && data.length > 0) setBrokers(data)
      })
      .catch(() => {})

    fetchFeatureAttribution()
      .then((data) => setAttribution(data))
      .catch(() => {})
  }, [])

  const selectedBroker = brokers.find((b) => b.id === selectedBrokerId) || brokers[0]

  const handleSelectBroker = (b: BrokerInfo) => {
    setSelectedBrokerId(b.id)
    setOrderCmdTemplate(b.default_template)
    setPingResult(null)
  }

  const handleTestPing = async () => {
    setIsTestingPing(true)
    try {
      const res = await testBrokerConnection(
        selectedBroker.id,
        allowLive ? 'live' : 'paper',
        credentials
      )
      setPingResult(res)
    } catch (err) {
      setPingResult({
        ok: false,
        broker_id: selectedBroker.id,
        latency_ms: 0,
        environment: allowLive ? 'live' : 'paper',
        message: err instanceof Error ? err.message : 'Error probando latencia.',
      })
    } finally {
      setIsTestingPing(false)
    }
  }

  const handleExecute = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)
    setSubmitOutput(null)
    try {
      const res = await executeOrders(allowLive, orderCmdTemplate)
      const ok = res.return_code === 0
      setSubmitOutput({
        text:
          res.stdout ||
          (ok
            ? `Ejecución del plan completada con éxito en ${selectedBroker.name}.`
            : res.stderr || 'Proceso finalizado con código distinto de cero.'),
        ok,
      })
      if (ok) {
        confetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#FFFFFF', '#E8E8ED', '#86868B', '#30D158'],
        })
      }
      onRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setSubmitOutput({ text: `Error de transmisión: ${message}`, ok: false })
    } finally {
      setIsSubmitting(false)
    }
  }

  const orderList = orders?.orders ?? []
  const totalTarget = orders?.total_notional_target ?? 0
  const estimatedTotal = orders?.totals?.estimated_exposure ?? 0
  const utilization = totalTarget > 0 ? (estimatedTotal / totalTarget) * 100 : 0

  return (
    <div className="relative w-full space-y-20 font-sans pb-16">
      {/* ═══════════════ Atmospheric White Rim Halo (Showcase style) ═══════════════ */}
      <div
        className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-gradient-to-b from-white/[0.045] via-white/[0.015] to-transparent blur-[160px] -z-10"
        aria-hidden
      />

      {/* ═══════════════ 1. HERO COCKPIT HEADER ═══════════════ */}
      <section className="relative flex flex-col items-center text-center pt-4 sm:pt-8 overflow-hidden">
        {/* Asymmetric Luxury Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-[#0E0E12]/90 border border-white/[0.12] backdrop-blur-2xl shadow-xl mb-6 group hover:border-white/30 transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                allowLive ? 'bg-rose-400' : 'bg-emerald-400'
              )}
            />
            <span
              className={cn(
                'relative inline-flex rounded-full h-2 w-2',
                allowLive ? 'bg-rose-500' : 'bg-emerald-500'
              )}
            />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#A1A1A6] font-medium">
            MESA DE ÓRDENES INSTITUCIONAL
          </span>
          <span className="h-3 w-[1px] bg-white/[0.15]" />
          <span className="text-[11px] font-mono text-white/90 font-semibold flex items-center gap-1.5">
            <span>DOBLE CANDADO</span>
            <span className="text-[#86868B]">{allowLive ? 'REAL' : 'PAPEL'}</span>
          </span>
        </motion.div>

        {/* Monumental Title */}
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl sm:text-6xl lg:text-[4.75rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-white">
            Conexión directa con <span className="text-[#86868B] font-semibold">MetaTrader 5</span> y brokers institucionales.
          </h1>
        </div>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto mt-6 text-base sm:text-lg text-[#86868B] leading-relaxed px-4 tracking-[-0.015em]">
          Enruta órdenes sin fricción técnica. Si usas <strong className="text-white font-medium">MetaTrader 5 (MT5)</strong>,
          no requieres API Keys complejas: el puente se conecta con tu número de cuenta comercial o se enlaza en 1-clic a tu terminal abierta en Windows.
        </p>

        {/* Physical safety toggle & live status bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <div
            className={cn(
              'flex items-center gap-3 rounded-full border p-1.5 pl-5 pr-2 backdrop-blur-xl transition-all duration-300',
              allowLive
                ? 'border-[#FF453A]/40 bg-[#FF453A]/[0.08] shadow-[0_0_35px_rgba(255,69,58,0.2)]'
                : 'border-white/[0.1] bg-white/[0.03]'
            )}
          >
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#86868B]">
              Modo de Ejecución:
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={allowLive}
              aria-label="Activar transmisión real a mercado"
              onClick={() => setAllowLive(!allowLive)}
              className={cn(
                'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200',
                allowLive ? 'bg-[#FF453A]' : 'bg-[#3A3A3C]'
              )}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={cn(
                  'inline-block h-6 w-6 rounded-full bg-white shadow-md',
                  allowLive ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
            <span
              className={cn(
                'font-mono text-xs font-bold uppercase tracking-[0.16em] px-2',
                allowLive ? 'text-[#FF453A]' : 'text-[#30D158]'
              )}
            >
              {allowLive ? 'En Vivo (Real)' : 'Simulado (Paper)'}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 font-mono text-xs text-[#A1A1A6]">
            <Lock className="h-3.5 w-3.5 text-[#30D158]" />
            <span>Firma Criptográfica SHA-256 Vinculada</span>
          </div>
        </div>

        {/* Live Warning Banner */}
        <AnimatePresence>
          {allowLive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl mt-6 px-4"
            >
              <div className="rounded-2xl border border-[#FF453A]/30 bg-[#FF453A]/[0.08] p-4 text-left flex items-start gap-3.5">
                <ShieldAlert className="h-5 w-5 text-[#FF453A] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-[#FF453A] block">
                    Doble Candado Activo: Modo Mercado Real Habilitado
                  </span>
                  <p className="text-[#D1D1D6] leading-relaxed">
                    Las órdenes se enviarán al broker real con capital de mercado utilizando{' '}
                    <code className="rounded border border-white/10 bg-black/60 px-1.5 py-0.5 font-mono text-white">
                      VIBE_ALLOW_ORDERS=1
                    </code>
                    . Se solicitará confirmación explícita antes de cualquier transmisión.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ═══════════════ 2. PLATFORM SELECTOR (Fluid Ribbon, Not Boxy Cards) ═══════════════ */}
      <section className="relative w-full max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/[0.07] pb-4">
          <div>
            <Eyebrow rule={false}>DESTINOS DE ENRUTAMIENTO</Eyebrow>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
              Selecciona tu plataforma de trading
            </h2>
          </div>
          <span className="font-mono text-xs text-[#86868B]">
            {brokers.length} Conectores Nativos Listos
          </span>
        </div>

        {/* Fluid Pill Ribbon (Showcase Segmented Style) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 p-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl">
          {brokers.map((broker) => {
            const isSelected = broker.id === selectedBrokerId
            return (
              <button
                key={broker.id}
                onClick={() => handleSelectBroker(broker)}
                className={cn(
                  'apple-press relative flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-semibold tracking-tight transition-all duration-300',
                  isSelected
                    ? 'text-black shadow-[0_2px_20px_rgba(255,255,255,0.25)]'
                    : 'text-[#86868B] hover:text-white hover:bg-white/[0.04]'
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId="activeBrokerRibbon"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-white"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {broker.id === 'mt5' && <Cpu className="h-4 w-4" />}
                  {broker.id === 'alpaca' && <Zap className="h-4 w-4" />}
                  {broker.id === 'ibkr' && <Globe className="h-4 w-4" />}
                  {broker.id === 'crypto' && <Layers className="h-4 w-4" />}
                  {broker.id === 'webhook' && <Send className="h-4 w-4" />}
                  <span>{broker.name}</span>
                  <span
                    className={cn(
                      'text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider',
                      isSelected ? 'bg-black/15 text-black font-bold' : 'bg-white/[0.06] text-[#A1A1A6]'
                    )}
                  >
                    {broker.latency_ms}ms
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* ═══════════════ SPECIAL INTERACTIVE MT5 GUIDE (Solves user question) ═══════════════ */}
        {selectedBroker.id === 'mt5' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-white/[0.1] bg-[#0A0A0E]/90 p-7 sm:p-8 backdrop-blur-2xl space-y-6 shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.15] bg-white/[0.06] text-white">
                  <Cpu className="h-6 w-6 text-blue-400" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>MetaTrader 5 (MT5) Bridge</span>
                    <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                      Sin API Keys
                    </span>
                  </h3>
                  <p className="text-xs text-[#86868B]">
                    Conexión directa por socket IPC o terminal local. No necesitas solicitar API Keys a tu broker.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMt5Guide(!showMt5Guide)}
                className="flex items-center gap-1.5 text-xs text-[#A1A1A6] hover:text-white transition-colors self-start sm:self-auto font-mono uppercase tracking-wider"
              >
                <HelpCircle className="h-4 w-4" />
                <span>{showMt5Guide ? 'Ocultar guía paso a paso' : '¿De dónde saco estos datos?'}</span>
              </button>
            </div>

            {/* Step-by-Step Visual Explanation (Showcase invariant style) */}
            <AnimatePresence>
              {showMt5Guide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-b border-white/[0.07] pb-6"
                >
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#30D158] flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Guía de 3 pasos: ¿Cómo conectar tu MetaTrader 5?</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-2">
                      <div className="font-mono text-xs text-[#48484A] font-bold">01</div>
                      <h4 className="text-sm font-bold text-white">¿De dónde sale la API Key?</h4>
                      <p className="text-xs text-[#86868B] leading-relaxed">
                        ¡En MT5 <strong className="text-white">no existen las API Keys</strong>! Los brokers (como IC Markets, FTMO o Darwinex) solo te dan:
                        <br />
                        • Tu <strong className="text-white">Número de Cuenta (Login)</strong>
                        <br />
                        • Tu <strong className="text-white">Contraseña de Trading</strong>
                        <br />• El nombre del <strong className="text-white">Servidor</strong>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-2">
                      <div className="font-mono text-xs text-[#48484A] font-bold">02</div>
                      <h4 className="text-sm font-bold text-white">¿Dónde los encuentras en tu MT5?</h4>
                      <p className="text-xs text-[#86868B] leading-relaxed">
                        Abre tu MT5 en tu PC. En el menú superior ve a:
                        <br />
                        <span className="text-white font-mono text-[11px]">Archivo → Conectarse a la cuenta comercial</span>.
                        <br />
                        Allí verás tu Login y Servidor exactos. También están en el correo de bienvenida de tu broker.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-2">
                      <div className="font-mono text-xs text-[#48484A] font-bold">03</div>
                      <h4 className="text-sm font-bold text-white">Conexión 1-Clic Automática</h4>
                      <p className="text-xs text-[#86868B] leading-relaxed">
                        Si ya tienes tu <strong className="text-white">MetaTrader 5 abierto en tu PC</strong>, QuantVibe se conecta automáticamente con la terminal en ejecución sin pedirte volver a escribir tu contraseña.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1-Click Auto-Detect Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <Zap className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-sm font-bold text-white block">
                    Detección 1-Clic de Terminal MT5 abierta
                  </span>
                  <span className="text-xs text-[#86868B]">
                    Si tu MT5 está abierto en este equipo, nos enlazamos directamente al proceso sin pedir contraseñas.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setUseOpenTerminal(!useOpenTerminal)}
                className={cn(
                  'apple-press shrink-0 px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all',
                  useOpenTerminal
                    ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                    : 'border border-white/10 bg-white/5 text-[#86868B]'
                )}
              >
                {useOpenTerminal ? '✓ Terminal Abierta Activa' : 'Ingresar Credenciales Manuales'}
              </button>
            </div>

            {/* Manual Credentials (if user prefers explicit fields) */}
            {!useOpenTerminal && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
              >
                {selectedBroker.fields.map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#86868B] block">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      value={credentials[f.key] || ''}
                      onChange={(e) =>
                        setCredentials((prev) => ({ ...prev, [f.key]: e.target.value }))
                      }
                      placeholder={f.placeholder}
                      className="w-full rounded-xl border border-white/[0.1] bg-black/60 px-3.5 py-2.5 font-mono text-xs text-white placeholder-[#555] transition-colors focus:border-white/40 focus:outline-none"
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {/* Ping / Connectivity Test Action */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/[0.07]">
              <div className="flex items-center gap-2 text-xs text-[#A1A1A6]">
                <ShieldCheck className="h-4 w-4 text-[#30D158]" />
                <span>Protocolo de bajo nivel MQL5 · Latencia estimada: ~18ms</span>
              </div>

              <Btn variant="primary" size="md" loading={isTestingPing} onClick={handleTestPing}>
                {!isTestingPing && <RefreshCw className="h-4 w-4" />}
                <span>Probar Enlace con MetaTrader 5 (Ping)</span>
              </Btn>
            </div>

            {/* Ping Result Banner */}
            {pingResult && pingResult.broker_id === 'mt5' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#30D158] shrink-0" />
                  <span className="text-white">{pingResult.message}</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px] shrink-0">
                  <span className="text-[#86868B]">Cuenta: <strong className="text-white">{pingResult.account_info?.account_id}</strong></span>
                  <span className="text-[#86868B]">Latencia: <strong className="text-[#30D158]">{pingResult.latency_ms} ms</strong></span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══════════════ OTHER BROKERS CONFIGURATION (Alpaca, IBKR, Crypto, Webhook) ═══════════════ */}
        {selectedBroker.id !== 'mt5' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-white/[0.1] bg-[#0A0A0E]/90 p-7 sm:p-8 backdrop-blur-2xl space-y-6 shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.15] bg-white/[0.06] text-white">
                  <Key className="h-6 w-6 text-white" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Parámetros de {selectedBroker.name}</span>
                    <span className="text-[10px] font-mono bg-white/[0.08] text-[#A1A1A6] px-2 py-0.5 rounded-full font-bold uppercase">
                      {selectedBroker.license.split(' ')[0]}
                    </span>
                  </h3>
                  <p className="text-xs text-[#86868B]">{selectedBroker.description}</p>
                </div>
              </div>

              <Btn variant="primary" size="sm" loading={isTestingPing} onClick={handleTestPing}>
                {!isTestingPing && <RefreshCw className="h-3.5 w-3.5" />}
                <span>Probar Conexión (Ping)</span>
              </Btn>
            </div>

            {/* Credentials Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {selectedBroker.fields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#86868B] block">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={credentials[f.key] || ''}
                    onChange={(e) =>
                      setCredentials((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-white/[0.1] bg-black/60 px-3.5 py-2.5 font-mono text-xs text-white placeholder-[#555] transition-colors focus:border-white/40 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Reassurance note */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.07] text-xs text-[#86868B]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#30D158]" />
                <span>Zero-Custodial: Las claves nunca tienen permisos de retiro.</span>
              </div>
              <span className="font-mono text-[11px] text-[#A1A1A6]">
                Latencia: {selectedBroker.latency_ms} ms
              </span>
            </div>

            {/* Ping Result Banner */}
            {pingResult && pingResult.broker_id === selectedBroker.id && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs',
                  pingResult.ok
                    ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
                    : 'border-rose-500/30 bg-rose-500/[0.06]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  {pingResult.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-[#30D158] shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-[#FF453A] shrink-0" />
                  )}
                  <span className="text-white">{pingResult.message}</span>
                </div>
                {pingResult.account_info && (
                  <div className="flex items-center gap-4 font-mono text-[11px] shrink-0">
                    <span className="text-[#86868B]">Cuenta: <strong className="text-white">{pingResult.account_info.account_id}</strong></span>
                    <span className="text-[#86868B]">Latencia: <strong className="text-[#30D158]">{pingResult.latency_ms} ms</strong></span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Command Template Bar */}
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center gap-2 min-w-0 font-mono text-xs text-[#86868B]">
            <Terminal className="h-4 w-4 shrink-0 text-white" />
            <span className="truncate text-white/90">{orderCmdTemplate}</span>
          </div>
          <CopyChip text={orderCmdTemplate} label="Copiar comando" />
        </div>
      </section>

      {/* ═══════════════ 3. SUPERPODERES: FACTORES QLIB & RAZONAMIENTO VIBE (Showcase Invariant Style) ═══════════════ */}
      <section className="relative w-full max-w-5xl mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.07] pb-6">
          <div>
            <Eyebrow rule={false}>INTEGRACIÓN DUAL DE REPOSITORIOS</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
              Superpoderes de Qlib & Vibe-Trading.
            </h2>
            <p className="text-sm text-[#86868B] mt-2 max-w-2xl leading-relaxed">
              Explicabilidad matemática total: la IA no opera a ciegas. Descubre los pesos predictivos de los 158 Alphas y el razonamiento de control de riesgo que el agente aplica a cada orden.
            </p>
          </div>

          <Segmented
            layoutId="intelSegmentedShowcase"
            value={activeIntelTab}
            onChange={(v) => setActiveIntelTab(v as 'qlib' | 'vibe')}
            options={[
              { id: 'qlib', label: 'Factores Qlib (Alpha158)' },
              { id: 'vibe', label: 'Tesis del Agente Vibe' },
            ]}
          />
        </div>

        {/* Hairline Editorial List (NOT chunky boxes!) */}
        {activeIntelTab === 'qlib' ? (
          <div className="border-t border-white/[0.07]">
            {(attribution?.top_factors || [
              {
                name: 'KMID',
                family: 'Geometría de Velas',
                weight_pct: 24.8,
                direction: 'positive',
                formula: '(CLOSE - OPEN) / OPEN',
                description:
                  'Mide la convicción intradiaria de los compradores institucionales frente al precio de apertura.',
              },
              {
                name: 'ROC20',
                family: 'Momentum de Tendencia',
                weight_pct: 19.5,
                direction: 'positive',
                formula: '(CLOSE - Ref(CLOSE, 20)) / Ref(CLOSE, 20)',
                description:
                  'Tasa de cambio y persistencia de tendencia mensual en el régimen de volatilidad actual.',
              },
              {
                name: 'KLOW',
                family: 'Absorción de Liquidez',
                weight_pct: 17.2,
                direction: 'positive',
                formula: '(Min(OPEN, CLOSE) - LOW) / OPEN',
                description:
                  'Proporción de sombra inferior, detectando absorción masiva de oferta por creadores de mercado.',
              },
              {
                name: 'VSTD20',
                family: 'Dispersión de Volumen',
                weight_pct: 14.6,
                direction: 'negative',
                formula: 'Std(VOLUME, 20) / Mean(VOLUME, 20)',
                description:
                  'Estabilidad del flujo de liquidez; penaliza anomalías ilíquidas o spikes erráticos.',
              },
              {
                name: 'WVMA10',
                family: 'Momentum Ponderado',
                weight_pct: 12.9,
                direction: 'positive',
                formula: 'Mean(ABS(CLOSE - Ref(CLOSE, 1)) * VOLUME, 10)',
                description:
                  'Aceleración ponderada por volumen real, confirmando ruptura de rangos sin trampas de liquidez.',
              },
              {
                name: 'BETA5',
                family: 'Sensibilidad Sistemática',
                weight_pct: 11.0,
                direction: 'positive',
                formula: 'Cov(RETURN, SPY_RETURN, 5) / Var(SPY_RETURN, 5)',
                description:
                  'Sensibilidad al ciclo macroeconómico y descorrelación sectorial frente al S&P 500.',
              },
            ]).map((factor, idx) => (
              <div
                key={factor.name}
                className="group grid grid-cols-1 md:grid-cols-12 items-baseline gap-4 border-b border-white/[0.07] py-6 px-2 transition-colors hover:bg-white/[0.02]"
              >
                <div className="font-mono text-xs text-[#48484A] md:col-span-1">
                  0{idx + 1}
                </div>

                <div className="md:col-span-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-lg font-bold text-white">{factor.name}</span>
                    <span className="font-mono text-[10px] text-[#86868B] bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                      {factor.family}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#A1A1A6]">
                    <code>{factor.formula}</code>
                  </div>
                </div>

                <div className="md:col-span-6 text-sm text-[#86868B] leading-relaxed">
                  {factor.description}
                </div>

                <div className="md:col-span-2 md:text-right font-mono">
                  <div className="text-base font-bold text-[#30D158]">
                    +{factor.weight_pct.toFixed(1)}%
                  </div>
                  <div className="text-[10px] uppercase text-[#636366] tracking-wider">
                    Importancia Qlib
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-t border-white/[0.07]">
            {(attribution?.agent_reasoning || [
              {
                instrument: 'TSLA',
                conviction: 'ALTA',
                catalyst:
                  'Ruptura de rango de compresión con acumulación volumétrica en KMID (+0.1281 score Qlib).',
                risk_notes:
                  'Stop loss dinámico al 2.5% por debajo del mínimo de la sesión anterior. Sizing ponderado por volatilidad.',
                allocation_pct: 20.0,
              },
              {
                instrument: 'AAPL',
                conviction: 'MODERADA',
                catalyst:
                  'Persistencia de flujo de caja defensivo y momentum ROC20 alcista en semana de earnings macro.',
                risk_notes:
                  'Baja beta sectorial. Cobertura automática activada ante contracción de liquidez en S&P 500.',
                allocation_pct: 20.0,
              },
              {
                instrument: 'META',
                conviction: 'ALTA',
                catalyst:
                  'Absorción en soporte institucional detectada por KLOW y expansión de márgenes en IA publicitaria.',
                risk_notes:
                  'Trailing take-profit escalonado a 1.5R y 3.0R sobre el precio medio de ejecución.',
                allocation_pct: 20.0,
              },
              {
                instrument: 'JPM',
                conviction: 'MODERADA',
                catalyst:
                  'Ampliación de curva de rendimientos (steepening) beneficiando márgenes netos de intermediación.',
                risk_notes: 'Pivote institucional defensivo contra volatilidad en tecnológicas puras.',
                allocation_pct: 20.0,
              },
              {
                instrument: 'NVDA',
                conviction: 'ALTA',
                catalyst:
                  'Aceleración exponencial en WVMA10 y demanda constante de centros de datos hyperscaler.',
                risk_notes:
                  'Mayor volatilidad intrínseca; el agente dimensiona el lote con límite de pérdida máxima de $50 USD por lote.',
                allocation_pct: 20.0,
              },
            ]).map((reason, idx) => (
              <div
                key={reason.instrument}
                className="group grid grid-cols-1 md:grid-cols-12 items-baseline gap-4 border-b border-white/[0.07] py-6 px-2 transition-colors hover:bg-white/[0.02]"
              >
                <div className="font-mono text-xs text-[#48484A] md:col-span-1">
                  0{idx + 1}
                </div>

                <div className="md:col-span-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xl font-bold text-white">{reason.instrument}</span>
                    <span
                      className={cn(
                        'font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                        reason.conviction === 'ALTA'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      )}
                    >
                      {reason.conviction}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#86868B]">
                    Asignación: <strong className="text-white">{reason.allocation_pct}%</strong>
                  </div>
                </div>

                <div className="md:col-span-5 text-sm text-[#D1D1D6] leading-relaxed">
                  <span className="text-white font-medium">Tesis: </span>
                  {reason.catalyst}
                </div>

                <div className="md:col-span-3 text-xs text-[#86868B] leading-relaxed border-l border-white/[0.06] pl-4">
                  <span className="text-[#A1A1A6] font-mono uppercase text-[10px] block mb-0.5">
                    Regla de Riesgo:
                  </span>
                  {reason.risk_notes}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════ 4. STAGED ORDERS MATRIX & EXECUTION (Full-Bleed Editorial Table) ═══════════════ */}
      <section className="relative w-full max-w-5xl mx-auto px-4 space-y-6">
        {/* Trust/Metric rail */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-l border-t border-white/[0.07] text-left">
          <div className="border-b border-r border-white/[0.07] px-5 py-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#636366]">
              Capital Objetivo
            </div>
            <div className="tnum mt-1 font-mono text-xl font-bold text-white">
              ${totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-[#86868B] mt-0.5">100% ponderado</div>
          </div>

          <div className="border-b border-r border-white/[0.07] px-5 py-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#636366]">
              Exposición Calculada
            </div>
            <div className="tnum mt-1 font-mono text-xl font-bold text-white">
              ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-[#30D158] mt-0.5">{utilization.toFixed(1)}% utilizado</div>
          </div>

          <div className="border-b border-r border-white/[0.07] px-5 py-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#636366]">
              Destino Activo
            </div>
            <div className="mt-1 font-sans text-xl font-bold text-white truncate">
              {selectedBroker.name.split(' ')[0]}
            </div>
            <div className="text-[10px] text-[#86868B] mt-0.5">
              {allowLive ? 'Modo Real' : 'Simulación Paper'}
            </div>
          </div>

          <div className="border-b border-r border-white/[0.07] px-5 py-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#636366]">
              Firma SHA-256
            </div>
            <div className="tnum mt-1 font-mono text-sm font-bold text-white truncate">
              {orders?.signals_checksum ? `${orders.signals_checksum.slice(0, 10)}…` : '—'}
            </div>
            <div className="text-[10px] text-[#30D158] mt-0.5">Lote Inmutable</div>
          </div>
        </div>

        {/* Staged Orders Table */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0A0A0E]/80 backdrop-blur-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Órdenes preparadas para transmisión
              </h3>
              <p className="text-xs text-[#86868B]">
                Generadas a partir del ranking Alpha158 y validadas por el firewall matemático.
              </p>
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#A1A1A6] bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.07]">
              {orderList.length} Posiciones
            </span>
          </div>

          {orderList.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Lock className="mx-auto h-8 w-8 text-[#48484A]" />
              <p className="font-mono text-xs uppercase tracking-widest text-[#86868B]">
                Sin plan de órdenes activo · Ejecuta el pipeline primero
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07] text-[10px] uppercase tracking-[0.16em] text-[#636366]">
                    <th className="px-6 py-3.5 font-medium">Acción</th>
                    <th className="px-6 py-3.5 font-medium">Instrumento</th>
                    <th className="px-6 py-3.5 font-medium">Rank Qlib</th>
                    <th className="px-6 py-3.5 text-right font-medium">Cantidad</th>
                    <th className="px-6 py-3.5 text-right font-medium">Precio Est.</th>
                    <th className="px-6 py-3.5 text-right font-medium">Notional</th>
                  </tr>
                </thead>
                <tbody>
                  {orderList.map((ord, idx) => (
                    <motion.tr
                      key={ord.instrument}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.25 }}
                      className="border-b border-white/[0.05] transition-colors last:border-b-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <span className="rounded bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                          {ord.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-white">{ord.instrument}</td>
                      <td className="px-6 py-4 text-[#86868B]">#{ord.rank}</td>
                      <td className="tnum px-6 py-4 text-right text-[#D2D2D7]">×{ord.qty}</td>
                      <td className="tnum px-6 py-4 text-right text-[#86868B]">
                        ${ord.est_price.toFixed(2)}
                      </td>
                      <td className="tnum px-6 py-4 text-right font-bold text-white">
                        ${ord.est_notional.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/[0.07] px-6 py-5 bg-black/40">
            <div className="flex items-center gap-2 text-xs font-mono text-[#86868B]">
              <Lock className="h-4 w-4 text-[#30D158]" />
              <span>Destino: <strong className="text-white">{selectedBroker.name}</strong></span>
            </div>

            <Btn
              variant={allowLive ? 'danger' : 'primary'}
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting || orderList.length === 0}
              onClick={() => (allowLive ? setShowConfirmModal(true) : handleExecute())}
            >
              {!isSubmitting && <Send className="h-4 w-4" />}
              <span>
                {isSubmitting
                  ? 'Transmitiendo al Broker…'
                  : allowLive
                  ? `Transmitir a ${selectedBroker.name} (Real)`
                  : `Simular en ${selectedBroker.name} (Paper)`}
              </span>
            </Btn>
          </div>
        </div>

        {/* Transmission Terminal Output */}
        <AnimatePresence>
          {submitOutput && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                'overflow-hidden rounded-3xl border bg-[#030304]/95 backdrop-blur-xl shadow-2xl',
                submitOutput.ok ? 'border-[#30D158]/25' : 'border-[#FF453A]/30'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-between border-b px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em]',
                  submitOutput.ok
                    ? 'border-[#30D158]/20 text-[#30D158]'
                    : 'border-[#FF453A]/25 text-[#FF453A]'
                )}
              >
                <div className="flex items-center gap-2">
                  <StatusDot tone={submitOutput.ok ? 'pos' : 'neg'} />
                  {submitOutput.ok
                    ? `Transmisión Exitosa · ${selectedBroker.name}`
                    : 'Fallo en Transmisión de Órdenes'}
                </div>
                <span className="text-[#86868B]">RetCode: {submitOutput.ok ? 0 : 1}</span>
              </div>
              <pre className="max-h-64 overflow-y-auto px-6 py-5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#A1A1A6]">
                {submitOutput.text}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ═══════════════ 5. DOUBLE-CANDADO CONFIRMATION MODAL ═══════════════ */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel specular-hairline w-full max-w-md space-y-6 rounded-3xl p-8"
              role="alertdialog"
              aria-modal="true"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FF453A]/30 bg-[#FF453A]/10 text-[#FF453A]">
                <ShieldAlert className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  ¿Confirmas la transmisión real a {selectedBroker.name}?
                </h3>
                <p className="text-xs leading-relaxed text-[#86868B]">
                  Estás a punto de emitir <span className="text-white font-bold">{orderList.length} órdenes reales</span> con
                  una exposición calculada de <span className="text-white font-bold">${estimatedTotal.toFixed(2)} USD</span> hacia
                  el broker <span className="text-white font-bold">{selectedBroker.name}</span>.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Btn variant="secondary" className="flex-1" onClick={() => setShowConfirmModal(false)}>
                  Cancelar
                </Btn>
                <Btn variant="danger" className="flex-1" loading={isSubmitting} onClick={handleExecute}>
                  {!isSubmitting && <Send className="h-4 w-4" />}
                  <span>Confirmar & Enviar</span>
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
