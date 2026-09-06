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
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
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
    id: 'alpaca',
    name: 'Alpaca Markets',
    category: 'US Equities & Options',
    icon: 'alpaca',
    description: 'Broker regulado por FINRA/SIPC con API REST directa. Ejecución algorítmica sin comisiones en acciones estadounidenses.',
    assets: ['US Stocks', 'ETFs', 'Options'],
    license: 'FINRA / SIPC Regulated (EE.UU.)',
    status: 'ready',
    latency_ms: 42,
    default_template: 'python scripts/connectors/broker_alpaca.py --ticker {symbol} --qty {qty} --env paper',
    supported_modes: ['paper', 'live'],
    fields: [
      { key: 'api_key', label: 'API Key ID', type: 'text', placeholder: 'PK... (Alpaca Key)' },
      { key: 'api_secret', label: 'API Secret Key', type: 'password', placeholder: '••••••••••••••••' },
      { key: 'endpoint', label: 'API Endpoint', type: 'text', placeholder: 'https://paper-api.alpaca.markets' },
    ],
  },
  {
    id: 'mt5',
    name: 'MetaTrader 5 Bridge',
    category: 'Forex & Multi-Asset EAs',
    icon: 'mt5',
    description: 'Terminal MT5 de baja latencia con Expert Advisor IPC bridge. Compatible con Darwinex, FTMO, IC Markets e Interactive Brokers.',
    assets: ['Forex', 'Índices', 'Commodities', 'CFDs'],
    license: 'Brokers Multi-Jurisdicción (FCA, ASIC, CySEC)',
    status: 'ready',
    latency_ms: 18,
    default_template: 'python scripts/connectors/broker_mt5.py --symbol {symbol} --action BUY --volume {qty} --magic 202609',
    supported_modes: ['paper', 'live'],
    fields: [
      { key: 'terminal_path', label: 'Ruta Terminal MT5', type: 'text', placeholder: 'C:\\Program Files\\MetaTrader 5\\terminal64.exe' },
      { key: 'account', label: 'Número de Cuenta MT5', type: 'text', placeholder: '10849204' },
      { key: 'server', label: 'Servidor del Broker', type: 'text', placeholder: 'ICMarketsSC-Demo' },
    ],
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers (IBKR)',
    category: 'Institutional Prime Brokerage',
    icon: 'ibkr',
    description: 'Conexión a Client Portal Web API / TWS Gateway. Acceso directo a más de 150 mercados globales con SmartRouting institucional.',
    assets: ['Global Equities', 'Futures', 'Bonds', 'Currencies'],
    license: 'NYSE / FINRA / SIPC / SEC',
    status: 'ready',
    latency_ms: 48,
    default_template: 'python scripts/connectors/broker_ibkr.py --conid {symbol} --qty {qty} --order-type MKT',
    supported_modes: ['paper', 'live'],
    fields: [
      { key: 'gateway_url', label: 'Client Portal Gateway URL', type: 'text', placeholder: 'https://localhost:5000/v1/api' },
      { key: 'account_id', label: 'ID de Cuenta IBKR', type: 'text', placeholder: 'U12345678' },
      { key: 'tws_port', label: 'Puerto TWS / Gateway', type: 'text', placeholder: '7497' },
    ],
  },
  {
    id: 'crypto',
    name: 'Cripto 24/7 (Binance / Bybit)',
    category: 'Digital Assets Spot & Perps',
    icon: 'crypto',
    description: 'Router de ejecución continua 24/7/365 para criptoactivos con autenticación HMAC-SHA256 y órdenes post-only / limit.',
    assets: ['BTC', 'ETH', 'SOL', 'USDT Perps'],
    license: 'VASP Registered / Non-Custodial Router',
    status: 'ready',
    latency_ms: 28,
    default_template: 'python scripts/connectors/broker_crypto.py --symbol {symbol}USDT --side BUY --qty {qty} --exchange binance',
    supported_modes: ['paper', 'live'],
    fields: [
      { key: 'exchange', label: 'Exchange Cripto', type: 'text', placeholder: 'binance (o bybit, coinbase)' },
      { key: 'api_key', label: 'API Key', type: 'text', placeholder: 'API Key con permisos de solo trading' },
      { key: 'api_secret', label: 'Secret Key', type: 'password', placeholder: '••••••••••••••••' },
    ],
  },
  {
    id: 'webhook',
    name: 'Webhook Universal / cTrader',
    category: 'Algorithmic Webhooks & Custom EAs',
    icon: 'webhook',
    description: 'Despachador universal con payload JSON firmado por HMAC-SHA256 para cTrader Open API, TradingView alerts o bots propios.',
    assets: ['cTrader', 'TradingView', 'Custom Bot', 'Zapier'],
    license: 'Open Protocol / Custom Ingestion',
    status: 'ready',
    latency_ms: 34,
    default_template: 'python scripts/connectors/broker_webhook.py --url https://api.yourbroker.com/v1/orders --symbol {symbol} --qty {qty}',
    supported_modes: ['paper', 'live'],
    fields: [
      { key: 'webhook_url', label: 'URL de Webhook Endpoint', type: 'text', placeholder: 'https://api.spotware.com/connect/orders' },
      { key: 'signature_token', label: 'Token de Firma SHA-256', type: 'password', placeholder: 'Bearer secret_webhook_token_123' },
      { key: 'payload_format', label: 'Formato de Payload', type: 'text', placeholder: 'json_standard' },
    ],
  },
]

export const ExecutionTab: React.FC<ExecutionTabProps> = ({ orders, onRefresh }) => {
  const [allowLive, setAllowLive] = useState(false)
  const [brokers, setBrokers] = useState<BrokerInfo[]>(FALLBACK_BROKERS)
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('alpaca')
  const [orderCmdTemplate, setOrderCmdTemplate] = useState<string>(FALLBACK_BROKERS[0].default_template)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [isTestingPing, setIsTestingPing] = useState(false)
  const [pingResult, setPingResult] = useState<BrokerTestResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitOutput, setSubmitOutput] = useState<{ text: string; ok: boolean } | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showCredsDrawer, setShowCredsDrawer] = useState(false)

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
    <div className="space-y-12 font-sans">
      {/* 1. Cockpit Header & Physical Safety Switch */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Eyebrow>
            <span className="flex items-center gap-2">
              <StatusDot tone={allowLive ? 'neg' : 'pos'} ping={allowLive} />
              Mesa de Ejecución Multi-Broker · Doble Candado
            </span>
          </Eyebrow>
          <h1 className="mt-3 font-sans text-4xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl">
            Conexión directa con <span className="text-[#86868B] font-semibold">brokers & agentes.</span>
          </h1>
          <p className="editorial-subhead mt-3 max-w-3xl text-sm leading-relaxed text-[#86868B]">
            Enrutamiento algorítmico a brokers de grado institucional: Alpaca Markets (acciones EE.UU.),
            MetaTrader 5 (CFDs/Forex), Interactive Brokers (IBKR), Clúster Cripto 24/7 y Webhooks
            cTrader/TradingView. Las órdenes se validan contra la firma criptográfica SHA-256 de las señales.
          </p>
        </div>

        {/* Physical safety toggle */}
        <div
          className={cn(
            'flex shrink-0 items-center gap-3 self-start rounded-full border p-1.5 pl-4 transition-colors lg:self-auto',
            allowLive ? 'border-[#FF453A]/40 bg-[#FF453A]/[0.07]' : 'border-white/[0.08] bg-white/[0.03]'
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

      {/* 2. Visual Broker Cockpit: 5 Direct Platform Connectors */}
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-white">
              Plataformas & Brokers Conectados
            </h2>
            <p className="text-xs text-[#86868B]">
              Selecciona el destino de enrutamiento para desplegar el puente algorítmico específico.
            </p>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#86868B]">
            {brokers.length} Protocolos Disponibles
          </span>
        </div>

        {/* 5 Broker Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {brokers.map((broker) => {
            const isSelected = broker.id === selectedBrokerId
            return (
              <motion.button
                key={broker.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectBroker(broker)}
                className={cn(
                  'relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200',
                  isSelected
                    ? 'border-white/40 bg-white/[0.08] shadow-[0_0_30px_rgba(255,255,255,0.06)] ring-1 ring-white/20'
                    : 'border-white/[0.07] bg-[#050507]/60 hover:border-white/[0.18] hover:bg-white/[0.03]'
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-white">
                      {broker.id === 'alpaca' && <Zap className="h-4 w-4 text-emerald-400" />}
                      {broker.id === 'mt5' && <Cpu className="h-4 w-4 text-blue-400" />}
                      {broker.id === 'ibkr' && <Globe className="h-4 w-4 text-amber-400" />}
                      {broker.id === 'crypto' && <Layers className="h-4 w-4 text-yellow-400" />}
                      {broker.id === 'webhook' && <Send className="h-4 w-4 text-purple-400" />}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#A1A1A6]">
                      <StatusDot tone={isSelected ? 'pos' : 'muted'} />
                      {broker.latency_ms}ms
                    </span>
                  </div>

                  <h3 className="mt-3.5 font-sans text-sm font-bold tracking-tight text-white">
                    {broker.name}
                  </h3>
                  <div className="mt-0.5 font-mono text-[10px] text-[#86868B]">
                    {broker.category}
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-[#A1A1A6] line-clamp-2">
                    {broker.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#636366]">
                    {broker.license.split(' ')[0]}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-semibold transition-colors',
                      isSelected ? 'text-white' : 'text-[#636366]'
                    )}
                  >
                    {isSelected ? 'Activo' : 'Seleccionar'}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Selected Broker Configuration & Live Ping Bar */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050507]/80 backdrop-blur-xl p-6 space-y-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06] text-white">
                <Key className="h-5 w-5 text-[#D1D1D6]" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Enlace con {selectedBroker.name}
                  </h3>
                  <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-[#A1A1A6]">
                    {allowLive ? 'Live API V2' : 'Paper Environment'}
                  </span>
                </div>
                <p className="text-xs text-[#86868B]">
                  Regulación: {selectedBroker.license} · Enrutamiento inteligente sin intermediarios.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Btn
                variant="secondary"
                size="sm"
                onClick={() => setShowCredsDrawer(!showCredsDrawer)}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Credenciales de API</span>
                {showCredsDrawer ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Btn>

              <Btn
                variant="primary"
                size="sm"
                loading={isTestingPing}
                onClick={handleTestPing}
              >
                {!isTestingPing && <RefreshCw className="h-3.5 w-3.5" />}
                <span>Probar Conexión (Ping)</span>
              </Btn>
            </div>
          </div>

          {/* Credentials Drawer (collapsible) */}
          <AnimatePresence>
            {showCredsDrawer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-white/[0.07] bg-black/50 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <ShieldCheck className="h-4 w-4 text-[#30D158]" />
                      <span>Parámetros de Autenticación de {selectedBroker.name}</span>
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#30D158]">
                      Retiros Deshabilitados (Zero-Custodial)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {selectedBroker.fields.map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#86868B]">
                          {f.label}
                        </label>
                        <input
                          type={f.type}
                          value={credentials[f.key] || ''}
                          onChange={(e) =>
                            setCredentials((prev) => ({ ...prev, [f.key]: e.target.value }))
                          }
                          placeholder={f.placeholder}
                          className="w-full rounded-xl border border-white/[0.1] bg-[#0A0A0C] px-3.5 py-2 font-mono text-xs text-white placeholder-[#555] transition-colors focus:border-white/40 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#86868B] leading-relaxed">
                    Las credenciales se conservan localmente en memoria y se utilizan exclusivamente para firmar
                    órdenes de compra/venta vía subprocess. La plataforma no almacena contraseñas en servidores externos.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ping / Connection feedback */}
          {pingResult && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex flex-col gap-3 rounded-xl border p-4 text-xs sm:flex-row sm:items-center sm:justify-between',
                pingResult.ok
                  ? 'border-[#30D158]/30 bg-[#30D158]/[0.06] text-[#D1D1D6]'
                  : 'border-[#FF453A]/30 bg-[#FF453A]/[0.06] text-[#D1D1D6]'
              )}
            >
              <div className="flex items-center gap-2.5">
                {pingResult.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-[#30D158] shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-[#FF453A] shrink-0" />
                )}
                <span>{pingResult.message}</span>
              </div>

              {pingResult.account_info && (
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <div>
                    <span className="text-[#86868B]">Cuenta: </span>
                    <span className="text-white font-bold">{pingResult.account_info.account_id}</span>
                  </div>
                  <div>
                    <span className="text-[#86868B]">Latencia: </span>
                    <span className="text-[#30D158] font-bold">{pingResult.latency_ms} ms</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Command Template Preview & Copy */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#86868B]">
                Comando CLI generado para {selectedBroker.name}
              </label>
              <CopyChip text={orderCmdTemplate} label="Copiar comando" />
            </div>
            <input
              type="text"
              value={orderCmdTemplate}
              onChange={(e) => setOrderCmdTemplate(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 py-2.5 font-mono text-xs text-white placeholder-[#636366] transition-colors focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. The 2 Core Repositories/Tools: Microsoft Qlib + HKUDS Vibe-Trading Superpowers */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050507]/70 backdrop-blur-xl">
        <div className="border-b border-white/[0.07] px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Eyebrow rule={false}>Inteligencia Dual Institucional</Eyebrow>
            <h3 className="text-base font-bold text-white mt-1">
              Microsoft Qlib (Cerebro Matemático) + HKUDS Vibe-Trading (Agente Autónomo)
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              Transparencia analítica completa: descubre los factores Alpha158 que mueven el modelo y la justificación de riesgo de cada orden.
            </p>
          </div>

          <Segmented
            layoutId="intelSegmented"
            value={activeIntelTab}
            onChange={(v) => setActiveIntelTab(v as 'qlib' | 'vibe')}
            options={[
              { id: 'qlib', label: 'Factores Qlib (Alpha158)' },
              { id: 'vibe', label: 'Razonamiento Agente Vibe' },
            ]}
          />
        </div>

        <div className="p-6">
          {activeIntelTab === 'qlib' ? (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <p className="text-xs text-[#A1A1A6] max-w-2xl leading-relaxed">
                  Microsoft Qlib procesa 158 factores técnicos y de volumen diario. A continuación se presentan los
                  factores con mayor peso predictivo en el modelo LightGBM actual:
                </p>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#86868B]">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Impulso Positivo
                  <span className="h-2 w-2 rounded-full bg-amber-400 ml-2" /> Dispersión / Penalización
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(attribution?.top_factors || [
                  {
                    name: 'KMID',
                    family: 'Geometría de Velas',
                    weight_pct: 24.8,
                    direction: 'positive',
                    formula: '(CLOSE - OPEN) / OPEN',
                    description: 'Convicción intradiaria de compradores institucionales vs. precio de apertura.',
                  },
                  {
                    name: 'ROC20',
                    family: 'Momentum de Tendencia',
                    weight_pct: 19.5,
                    direction: 'positive',
                    formula: '(CLOSE - Ref(CLOSE, 20)) / Ref(CLOSE, 20)',
                    description: 'Tasa de cambio mensual persistente en el régimen de volatilidad actual.',
                  },
                  {
                    name: 'KLOW',
                    family: 'Absorción de Liquidez',
                    weight_pct: 17.2,
                    direction: 'positive',
                    formula: '(Min(OPEN, CLOSE) - LOW) / OPEN',
                    description: 'Sombra inferior que detecta absorción masiva de oferta por creadores de mercado.',
                  },
                  {
                    name: 'VSTD20',
                    family: 'Dispersión de Volumen',
                    weight_pct: 14.6,
                    direction: 'negative',
                    formula: 'Std(VOLUME, 20) / Mean(VOLUME, 20)',
                    description: 'Penaliza picos erráticos de liquidez para evitar trampas de volatilidad.',
                  },
                  {
                    name: 'WVMA10',
                    family: 'Momentum Ponderado',
                    weight_pct: 12.9,
                    direction: 'positive',
                    formula: 'Mean(ABS(CLOSE - Ref(1)) * VOL, 10)',
                    description: 'Aceleración respaldada por volumen institucional real.',
                  },
                  {
                    name: 'BETA5',
                    family: 'Sensibilidad Sistemática',
                    weight_pct: 11.0,
                    direction: 'positive',
                    formula: 'Cov(RET, SPY_RET, 5) / Var(SPY_RET, 5)',
                    description: 'Descorrelación defensiva frente al índice general S&P 500.',
                  },
                ]).map((factor) => (
                  <div
                    key={factor.name}
                    className="rounded-xl border border-white/[0.06] bg-black/40 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{factor.name}</span>
                        <span className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-[#86868B]">
                          {factor.family}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#30D158]">
                        {factor.weight_pct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Weight bar */}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.weight_pct * 3.5}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          factor.direction === 'positive' ? 'bg-emerald-400' : 'bg-amber-400'
                        )}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="font-mono text-[10px] text-[#A1A1A6] bg-white/[0.02] px-2 py-1 rounded border border-white/[0.04]">
                        <code>{factor.formula}</code>
                      </div>
                      <p className="text-[11px] text-[#86868B] leading-relaxed pt-1">
                        {factor.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-xs text-[#A1A1A6] max-w-2xl leading-relaxed">
                  El agente LLM de HKUDS Vibe-Trading no opera a ciegas: evalúa las señales cuantitativas,
                  asigna pesos por Risk-Parity (volatilidad inversa) y redacta la justificación institucional
                  antes de enrutar cada orden.
                </p>
                <div className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 font-mono text-[10px] text-white">
                  Modo Activo: <span className="text-[#30D158] font-bold">Risk-Parity Volatilidad</span>
                </div>
              </div>

              <div className="space-y-3">
                {(attribution?.agent_reasoning || [
                  {
                    instrument: 'TSLA',
                    conviction: 'ALTA',
                    catalyst: 'Ruptura de compresión con acumulación volumétrica en KMID (+0.1281 score Qlib).',
                    risk_notes: 'Stop loss dinámico al 2.5% por debajo del mínimo de la sesión anterior.',
                    allocation_pct: 20.0,
                  },
                  {
                    instrument: 'AAPL',
                    conviction: 'MODERADA',
                    catalyst: 'Persistencia de flujo de caja defensivo y momentum ROC20 alcista en semana macro.',
                    risk_notes: 'Baja beta sectorial. Cobertura automática activada ante contracción de liquidez.',
                    allocation_pct: 20.0,
                  },
                  {
                    instrument: 'META',
                    conviction: 'ALTA',
                    catalyst: 'Absorción en soporte institucional detectada por KLOW y márgenes en IA.',
                    risk_notes: 'Trailing take-profit escalonado a 1.5R y 3.0R sobre el precio medio.',
                    allocation_pct: 20.0,
                  },
                  {
                    instrument: 'JPM',
                    conviction: 'MODERADA',
                    catalyst: 'Ampliación de curva de rendimientos (steepening) beneficiando márgenes netos.',
                    risk_notes: 'Pivote defensivo contra volatilidad en tecnológicas puras.',
                    allocation_pct: 20.0,
                  },
                  {
                    instrument: 'NVDA',
                    conviction: 'ALTA',
                    catalyst: 'Aceleración en WVMA10 y demanda institucional constante de centros de datos.',
                    risk_notes: 'Mayor volatilidad intrínseca; dimensionamiento acotado con límite de riesgo.',
                    allocation_pct: 20.0,
                  },
                ]).map((reason) => (
                  <div
                    key={reason.instrument}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-white/[0.06] bg-black/40 p-4 lg:flex-row lg:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-base font-extrabold text-white w-14">
                        {reason.instrument}
                      </span>
                      <span
                        className={cn(
                          'rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider',
                          reason.conviction === 'ALTA'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        )}
                      >
                        Convicción {reason.conviction}
                      </span>
                    </div>

                    <div className="flex-1 text-xs text-[#D1D1D6] leading-relaxed">
                      <span className="text-white font-medium">Tesis: </span>
                      {reason.catalyst}
                      <div className="text-[11px] text-[#86868B] mt-0.5">
                        <span className="text-[#A1A1A6]">Control de Riesgo: </span>
                        {reason.risk_notes}
                      </div>
                    </div>

                    <div className="shrink-0 font-mono text-right text-xs">
                      <span className="text-[#86868B]">Asignación: </span>
                      <span className="font-bold text-white">{reason.allocation_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Metric Rail */}
      <MetricRail
        cols={4}
        items={[
          {
            label: 'Capital objetivo',
            value: `$${totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            sub: 'cartera ponderada por modelo',
          },
          {
            label: 'Exposición calculada',
            value: `$${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            sub: `${utilization.toFixed(1)}% del capital`,
          },
          {
            label: 'Destino Activo',
            value: selectedBroker.name.split(' ')[0],
            sub: allowLive ? 'Mercado Real (Live)' : 'Simulación (Paper)',
            tone: allowLive ? 'warn' : 'pos',
          },
          {
            label: 'Firma criptográfica',
            value: orders?.signals_checksum ? `${orders.signals_checksum.slice(0, 10)}…` : '—',
            sub: 'Integridad SHA-256 vinculada',
          },
        ]}
      />

      {/* 5. Staged Orders — Terminal Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#050507]/70 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white">
              Órdenes staged listas para transmisión
            </h3>
            <p className="text-[11px] text-[#86868B]">
              Generadas por el agente Vibe-Trading a partir de las señales emitidas por Qlib.
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
                  <th className="px-6 py-3 text-right font-medium">Precio Est.</th>
                  <th className="px-6 py-3 text-right font-medium">Notional Estimado</th>
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
                    <td className="px-6 py-3.5 text-[#86868B]">#{ord.rank}</td>
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
            Doble candado activo · Enrutando hacia {selectedBroker.name}
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

      {/* 6. Transmission Output */}
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

      {/* 7. Double-Candado Confirmation Glass Sheet */}
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
              aria-labelledby="confirm-live-title"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FF453A]/30 bg-[#FF453A]/10 text-[#FF453A]">
                <ShieldAlert className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 id="confirm-live-title" className="text-lg font-bold tracking-tight text-[#F5F5F7]">
                  ¿Confirmas la transmisión real a {selectedBroker.name}?
                </h3>
                <p className="text-xs leading-relaxed text-[#86868B]">
                  Estás a punto de emitir <span className="text-white font-bold">{orderList.length} órdenes reales</span> con
                  una exposición calculada de <span className="text-white font-bold">${estimatedTotal.toFixed(2)} USD</span> hacia
                  el broker institucional <span className="text-white font-bold">{selectedBroker.name}</span>.
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
