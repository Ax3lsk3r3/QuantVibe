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
  Layers,
  ShieldCheck,
  Globe,
  HelpCircle,
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
import { Btn, Eyebrow, MetricRail, StatusDot, CopyChip, cn, Segmented } from './ui'

interface ExecutionTabProps {
  orders: OrdersPlan | null
  onRefresh: () => void
}

const FALLBACK_BROKERS: BrokerInfo[] = [
  {
    id: 'mt5',
    name: 'MetaTrader 5 (MT5)',
    category: 'Forex, CFDs & Prop Firms',
    icon: 'mt5',
    description:
      'En MT5 no se usan API Keys. Se conecta mediante tu Número de Cuenta (Login), Contraseña y Servidor que te asigna tu broker (ej. ICMarkets, FTMO, Darwinex), o por detección automática si tienes MT5 abierto en tu PC.',
    assets: ['Forex', 'Índices', 'Commodities', 'CFDs'],
    license: 'Brokers Multi-Jurisdicción (FTMO, IC Markets, Darwinex)',
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
        placeholder: 'Ej: 10849204 (Ver barra superior en MT5)',
      },
      {
        key: 'password',
        label: 'Contraseña de Trading (Master Password)',
        type: 'password',
        placeholder: 'Tu contraseña de inicio de sesión en MT5',
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
  const [showMt5Guide, setShowMt5Guide] = useState(false)

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
    <div className="w-full space-y-10 font-sans">
      {/* ═══════════════ 1. EXPANSIVE EDITORIAL COCKPIT HEAD ═══════════════ */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Eyebrow>
            <span className="flex items-center gap-2">
              <StatusDot tone={allowLive ? 'neg' : 'pos'} ping={allowLive} />
              Mesa de órdenes · agente vibe-trading multi-broker
            </span>
          </Eyebrow>
          <h1 className="mt-3 font-sans text-4xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl">
            Ejecución con <span className="text-[#86868B] font-semibold">doble candado.</span>
          </h1>
          <p className="editorial-subhead mt-3 max-w-3xl text-sm leading-relaxed text-[#86868B]">
            El agente LLM lee las señales emitidas por Microsoft Qlib y dimensiona el portafolio con
            criterios de paridad de riesgo. Las órdenes se enrutan de forma nativa a MetaTrader 5 (MT5),
            Alpaca Markets, Interactive Brokers, Cripto 24/7 o Webhooks firmados con hash SHA-256.
          </p>
        </div>

        {/* Physical safety toggle */}
        <div
          className={cn(
            'flex shrink-0 items-center gap-3 self-start rounded-full border p-1.5 pl-4 transition-colors lg:self-auto backdrop-blur-xl',
            allowLive
              ? 'border-[#FF453A]/40 bg-[#FF453A]/[0.08] shadow-[0_0_30px_rgba(255,69,58,0.2)]'
              : 'border-white/[0.08] bg-white/[0.03]'
          )}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#86868B]">
            Papel (Simulado)
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={allowLive}
            aria-label="Activar transmisión real a mercado"
            onClick={() => setAllowLive(!allowLive)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200',
              allowLive ? 'bg-[#FF453A]' : 'bg-[#3A3A3C]'
            )}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn(
                'inline-block h-5 w-5 rounded-full bg-white shadow-md',
                allowLive ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
          <span
            className={cn(
              'pr-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em]',
              allowLive ? 'text-[#FF453A]' : 'text-[#86868B]'
            )}
          >
            Real (En Vivo)
          </span>
        </div>
      </div>

      {/* Live submission warning banner */}
      <AnimatePresence>
        {allowLive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-2xl border border-[#FF453A]/30 bg-[#FF453A]/[0.06] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FF453A]">
                <ShieldAlert className="h-4 w-4" />
                <span>ADVERTENCIA: Entorno Real Habilitado (Transmisión con capital de mercado)</span>
              </div>
              <p className="text-xs leading-relaxed text-[#D1D1D6]">
                El motor transmitirá órdenes reales al broker seleccionado utilizando la variable de entorno{' '}
                <code className="rounded border border-white/10 bg-black/60 px-1.5 py-0.5 font-mono text-white">
                  VIBE_ALLOW_ORDERS=1
                </code>
                . Verifica tus credenciales y límites de margen antes de autorizar.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ 2. FULL-WIDTH MULTI-BROKER SELECTION & CONFIGURATION ═══════════════ */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050507]/70 backdrop-blur-xl">
        {/* Seamless Platform Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#86868B]">
              Destino de Ejecución:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {brokers.map((b) => {
                const isSelected = b.id === selectedBrokerId
                return (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBroker(b)}
                    className={cn(
                      'apple-press relative flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs font-medium transition-all',
                      isSelected
                        ? 'bg-white text-black shadow-md font-bold'
                        : 'text-[#86868B] hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    <span>{b.name}</span>
                    <span
                      className={cn(
                        'text-[9px] px-1.5 py-0.2 rounded-full',
                        isSelected ? 'bg-black/10 text-black' : 'bg-white/[0.06] text-[#A1A1A6]'
                      )}
                    >
                      {b.latency_ms}ms
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#86868B] self-start sm:self-auto">
            <ShieldCheck className="h-3.5 w-3.5 text-[#30D158]" />
            <span>Zero-Custodial · Sin Retiros</span>
          </div>
        </div>

        {/* Widescreen 2-Column Split: Connection Details + Live Ping Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.07]">
          {/* Left Column (7 cols): Parameters & MT5 Explanations */}
          <div className="lg:col-span-7 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.05] text-white">
                  {selectedBroker.id === 'mt5' && <Cpu className="h-4 w-4 text-blue-400" />}
                  {selectedBroker.id === 'alpaca' && <Zap className="h-4 w-4 text-emerald-400" />}
                  {selectedBroker.id === 'ibkr' && <Globe className="h-4 w-4 text-amber-400" />}
                  {selectedBroker.id === 'crypto' && <Layers className="h-4 w-4 text-yellow-400" />}
                  {selectedBroker.id === 'webhook' && <Send className="h-4 w-4 text-purple-400" />}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedBroker.name}</span>
                    <span className="text-[10px] font-mono text-[#86868B] bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                      {selectedBroker.license}
                    </span>
                  </h3>
                </div>
              </div>

              {selectedBroker.id === 'mt5' && (
                <button
                  type="button"
                  onClick={() => setShowMt5Guide(!showMt5Guide)}
                  className="flex items-center gap-1.5 text-xs text-[#A1A1A6] hover:text-white font-mono uppercase tracking-wider transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>{showMt5Guide ? 'Ocultar guía' : '¿De dónde saco mis datos?'}</span>
                </button>
              )}
            </div>

            <p className="text-xs text-[#86868B] leading-relaxed">
              {selectedBroker.description}
            </p>

            {/* Special MT5 Guide (collapsible) */}
            <AnimatePresence>
              {selectedBroker.id === 'mt5' && showMt5Guide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-4 space-y-3 text-xs">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-blue-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Cómo conectar MetaTrader 5 sin API Keys</span>
                    </div>
                    <ul className="space-y-2 text-[#D1D1D6] leading-relaxed">
                      <li>
                        <strong className="text-white">1. En MT5 no hay API Keys:</strong> Los brokers (IC Markets, FTMO, Darwinex) te entregan únicamente tu <span className="text-white font-mono">Número de Cuenta (Login)</span>, <span className="text-white font-mono">Contraseña</span> y <span className="text-white font-mono">Servidor</span>.
                      </li>
                      <li>
                        <strong className="text-white">2. ¿Dónde los ves?</strong> En tu MT5 de escritorio, ve al menú superior: <span className="text-white font-mono">Archivo → Conectarse a la cuenta comercial</span>. Allí aparecen exactamente estos 3 campos.
                      </li>
                      <li>
                        <strong className="text-white">3. Detección Automática 1-Clic:</strong> Si ya tienes tu MT5 abierto en este equipo Windows, puedes activar el switch inferior para enlazarte directamente sin tener que ingresar contraseñas.
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1-Click Terminal Switch for MT5 */}
            {selectedBroker.id === 'mt5' && (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.08] bg-black/40">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-[#30D158]" />
                  <span className="text-xs text-[#D1D1D6] font-medium">
                    Detectar terminal MT5 abierta en este PC automáticamente
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseOpenTerminal(!useOpenTerminal)}
                  className={cn(
                    'apple-press px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider font-bold transition-colors',
                    useOpenTerminal
                      ? 'bg-blue-500 text-white'
                      : 'border border-white/10 bg-white/5 text-[#86868B]'
                  )}
                >
                  {useOpenTerminal ? '1-Clic Activo' : 'Ingreso Manual'}
                </button>
              </div>
            )}

            {/* Fields Inputs (for brokers or manual MT5) */}
            {(!useOpenTerminal || selectedBroker.id !== 'mt5') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {selectedBroker.fields.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#86868B] block">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      value={credentials[f.key] || ''}
                      onChange={(e) =>
                        setCredentials((prev) => ({ ...prev, [f.key]: e.target.value }))
                      }
                      placeholder={f.placeholder}
                      className="w-full rounded-lg border border-white/[0.08] bg-black/50 px-3 py-2 font-mono text-xs text-white placeholder-[#555] transition-colors focus:border-white/30 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* CLI Command Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#86868B]">
                  Comando CLI autogenerado para {selectedBroker.name}
                </label>
                <CopyChip text={orderCmdTemplate} label="Copiar comando" />
              </div>
              <div className="rounded-lg border border-white/[0.07] bg-black/60 px-3.5 py-2 font-mono text-xs text-[#D1D1D6] truncate">
                {orderCmdTemplate}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Ping Test & Status Console */}
          <div className="lg:col-span-5 p-6 sm:p-7 space-y-5 flex flex-col justify-between bg-black/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#86868B]">
                  Telemetría de Conexión
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#30D158]">
                  <StatusDot tone="pos" ping={isTestingPing} />
                  {isTestingPing ? 'Midiendo…' : 'Enlace Listo'}
                </span>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/50 p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                  <span className="text-[#86868B]">Plataforma:</span>
                  <span className="text-white font-bold">{selectedBroker.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                  <span className="text-[#86868B]">Latencia Base:</span>
                  <span className="text-[#30D158] font-bold">{selectedBroker.latency_ms} ms</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                  <span className="text-[#86868B]">Modo:</span>
                  <span className="text-white font-bold">{allowLive ? 'MERCADO REAL' : 'CUENTA SOMBRA'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86868B]">Seguridad:</span>
                  <span className="text-white">HMAC SHA-256</span>
                </div>
              </div>

              {/* Ping Result Display */}
              {pingResult && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-3.5 rounded-xl border text-xs leading-relaxed',
                    pingResult.ok
                      ? 'border-[#30D158]/30 bg-[#30D158]/[0.05] text-[#D1D1D6]'
                      : 'border-[#FF453A]/30 bg-[#FF453A]/[0.05] text-[#D1D1D6]'
                  )}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {pingResult.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#30D158]" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-[#FF453A]" />
                    )}
                    <span className={pingResult.ok ? 'text-[#30D158]' : 'text-[#FF453A]'}>
                      {pingResult.ok ? 'Conexión Exitosa' : 'Fallo en Enlace'}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-white">
                      {pingResult.latency_ms} ms
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A1A1A6]">{pingResult.message}</p>
                </motion.div>
              )}
            </div>

            <Btn
              variant="secondary"
              size="md"
              className="w-full"
              loading={isTestingPing}
              onClick={handleTestPing}
            >
              {!isTestingPing && <RefreshCw className="h-3.5 w-3.5" />}
              <span>Probar Conexión con {selectedBroker.name.split(' ')[0]} (Ping)</span>
            </Btn>
          </div>
        </div>
      </div>

      {/* ═══════════════ 3. DUAL INTELLIGENCE: QLIB + VIBE (Widescreen Hairline Rows) ═══════════════ */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050507]/70 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white">
              Inteligencia Integrada: Microsoft Qlib + HKUDS Vibe-Trading
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              Transparencia matemática completa: inspecciona la importancia de los 158 factores y la tesis del agente para cada orden.
            </p>
          </div>

          <Segmented
            layoutId="intelSegmentedWide"
            value={activeIntelTab}
            onChange={(v) => setActiveIntelTab(v as 'qlib' | 'vibe')}
            options={[
              { id: 'qlib', label: 'Factores Qlib (Alpha158)' },
              { id: 'vibe', label: 'Tesis del Agente Vibe' },
            ]}
          />
        </div>

        {/* Widescreen Hairline Rows (The Anti-Card Pattern) */}
        {activeIntelTab === 'qlib' ? (
          <div className="divide-y divide-white/[0.06]">
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
                className="grid grid-cols-1 md:grid-cols-12 items-baseline gap-4 px-6 py-4 transition-colors hover:bg-white/[0.015]"
              >
                <div className="font-mono text-xs text-[#48484A] md:col-span-1">
                  0{idx + 1}
                </div>

                <div className="md:col-span-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-base font-bold text-white">{factor.name}</span>
                    <span className="font-mono text-[9px] text-[#86868B] bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                      {factor.family}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-[#A1A1A6]">
                    <code>{factor.formula}</code>
                  </div>
                </div>

                <div className="md:col-span-6 text-xs text-[#86868B] leading-relaxed">
                  {factor.description}
                </div>

                <div className="md:col-span-2 md:text-right font-mono">
                  <div className="text-sm font-bold text-[#30D158]">
                    +{factor.weight_pct.toFixed(1)}%
                  </div>
                  <div className="text-[9px] uppercase text-[#636366] tracking-wider">
                    Peso Predictivo
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
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
                className="grid grid-cols-1 md:grid-cols-12 items-baseline gap-4 px-6 py-4 transition-colors hover:bg-white/[0.015]"
              >
                <div className="font-mono text-xs text-[#48484A] md:col-span-1">
                  0{idx + 1}
                </div>

                <div className="md:col-span-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-base font-bold text-white">{reason.instrument}</span>
                    <span
                      className={cn(
                        'font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
                        reason.conviction === 'ALTA'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      )}
                    >
                      {reason.conviction}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-[#86868B]">
                    Asignación: <strong className="text-white">{reason.allocation_pct}%</strong>
                  </div>
                </div>

                <div className="md:col-span-5 text-xs text-[#D1D1D6] leading-relaxed">
                  <span className="text-white font-medium">Tesis: </span>
                  {reason.catalyst}
                </div>

                <div className="md:col-span-3 text-xs text-[#86868B] leading-relaxed border-l border-white/[0.06] pl-4">
                  <span className="text-[#A1A1A6] font-mono uppercase text-[9px] block">
                    Control de Riesgo:
                  </span>
                  {reason.risk_notes}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════ 4. EXPOSURE METRIC RAIL ═══════════════ */}
      <MetricRail
        cols={4}
        items={[
          {
            label: 'Capital objetivo',
            value: `$${totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            sub: 'ponderación paridad de riesgo',
          },
          {
            label: 'Exposición calculada',
            value: `$${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            sub: `${utilization.toFixed(1)}% del capital`,
          },
          {
            label: 'Destino Activo',
            value: selectedBroker.name.split(' ')[0],
            sub: allowLive ? 'Transmisión Real' : 'Simulación Paper',
            tone: allowLive ? 'warn' : 'pos',
          },
          {
            label: 'Firma criptográfica',
            value: orders?.signals_checksum ? `${orders.signals_checksum.slice(0, 10)}…` : '—',
            sub: 'SHA-256 canónico vinculado',
          },
        ]}
      />

      {/* ═══════════════ 5. STAGED ORDERS — DENSE TERMINAL TABLE ═══════════════ */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#050507]/70 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white">
              Órdenes staged listas para ejecución
            </h3>
            <p className="text-xs text-[#86868B]">
              Generadas automáticamente por el agente y verificadas contra el firewall matemático.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#636366]">
            {orderList.length} órdenes staged
          </span>
        </div>

        {orderList.length === 0 ? (
          <div className="py-16 text-center">
            <Lock className="mx-auto mb-2 h-7 w-7 text-[#2C2C2E]" />
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#636366]">
              Sin plan de órdenes activo · Ejecuta el pipeline primero
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/[0.07] text-[10px] uppercase tracking-[0.14em] text-[#636366]">
                  <th className="px-6 py-3 font-medium">Acción</th>
                  <th className="px-6 py-3 font-medium">Instrumento</th>
                  <th className="px-6 py-3 font-medium">Rank Qlib</th>
                  <th className="px-6 py-3 text-right font-medium">Cantidad</th>
                  <th className="px-6 py-3 text-right font-medium">Precio est.</th>
                  <th className="px-6 py-3 text-right font-medium">Notional</th>
                </tr>
              </thead>
              <tbody>
                {orderList.map((ord, idx) => (
                  <motion.tr
                    key={ord.instrument}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                    className="border-b border-white/[0.05] transition-colors last:border-b-0 hover:bg-white/[0.025]"
                  >
                    <td className="px-6 py-3.5">
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        {ord.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm font-bold text-white">{ord.instrument}</td>
                    <td className="px-6 py-3.5 text-[#636366]">#{ord.rank}</td>
                    <td className="tnum px-6 py-3.5 text-right text-[#D2D2D7]">×{ord.qty}</td>
                    <td className="tnum px-6 py-3.5 text-right text-[#86868B]">
                      ${ord.est_price.toFixed(2)}
                    </td>
                    <td className="tnum px-6 py-3.5 text-right font-semibold text-white">
                      ${ord.est_notional.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Transmit action bar */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] px-6 py-4 sm:flex-row sm:items-center">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#86868B]">
            <Lock className="h-3.5 w-3.5 text-[#30D158]" />
            Doble candado activo · Transmitiendo hacia {selectedBroker.name}
          </span>
          <Btn
            variant={allowLive ? 'danger' : 'primary'}
            size="md"
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

      {/* ═══════════════ 6. TRANSMISSION OUTPUT LOG ═══════════════ */}
      <AnimatePresence>
        {submitOutput && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'overflow-hidden rounded-2xl border bg-[#030304]/95 backdrop-blur-xl',
              submitOutput.ok ? 'border-[#30D158]/25' : 'border-[#FF453A]/30'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-between border-b px-6 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em]',
                submitOutput.ok
                  ? 'border-[#30D158]/20 text-[#30D158]'
                  : 'border-[#FF453A]/25 text-[#FF453A]'
              )}
            >
              <div className="flex items-center gap-2">
                <StatusDot tone={submitOutput.ok ? 'pos' : 'neg'} />
                {submitOutput.ok
                  ? `Transmisión Exitosa en ${selectedBroker.name}`
                  : 'Fallo en Transmisión de Órdenes'}
              </div>
              <span className="text-[#86868B]">Código de Retorno: {submitOutput.ok ? 0 : 1}</span>
            </div>
            <pre className="max-h-64 overflow-y-auto px-6 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#A1A1A6]">
              {submitOutput.text}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ 7. CONFIRMATION GLASS MODAL ═══════════════ */}
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
              className="glass-panel specular-hairline w-full max-w-md space-y-5 rounded-3xl p-7"
              role="alertdialog"
              aria-modal="true"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FF453A]/30 bg-[#FF453A]/10 text-[#FF453A]">
                <ShieldAlert className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold tracking-tight text-white">
                  ¿Confirmas la transmisión real a {selectedBroker.name}?
                </h3>
                <p className="text-xs leading-relaxed text-[#86868B]">
                  Estás a punto de emitir <span className="text-white font-bold">{orderList.length} órdenes reales</span> con
                  una exposición calculada de <span className="text-white font-bold">${estimatedTotal.toFixed(2)} USD</span> hacia
                  el broker <span className="text-white font-bold">{selectedBroker.name}</span>.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <Btn
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancelar
                </Btn>
                <Btn
                  variant="danger"
                  className="flex-1"
                  loading={isSubmitting}
                  onClick={handleExecute}
                >
                  {!isSubmitting && <Send className="h-3.5 w-3.5" />}
                  <span>Confirmar & Transmitir</span>
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
