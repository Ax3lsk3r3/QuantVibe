import React, { useState, useEffect, useRef } from 'react'
import {
  Globe,
  Radio,
  Sliders,
  CheckCircle2,
  Terminal,
  Activity,
} from 'lucide-react'

export const BloombergTerminal: React.FC = () => {
  const [activeUniverse, setActiveUniverse] = useState<string>('sp10')
  const [customTickers, setCustomTickers] = useState<string>('PLTR, SMCI, ARM, COIN, MSTR')

  const marketQuotesContainerRef = useRef<HTMLDivElement>(null)
  const newsContainerRef = useRef<HTMLDivElement>(null)
  const screenerContainerRef = useRef<HTMLDivElement>(null)

  // Universe configurations proving QuantVibe is not limited to 10 tickers
  const universes = [
    {
      id: 'sp10',
      name: 'Mega-Cap Tech & S&P 10',
      category: 'Renta Variable US',
      tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'XOM'],
      desc: 'El universo por defecto calibrado para factor mining Alpha158.',
    },
    {
      id: 'semis',
      name: 'Semiconductores & Hardware IA',
      category: 'Hardware & Chips',
      tickers: ['NVDA', 'TSM', 'AMD', 'AVGO', 'ASML', 'QCOM', 'INTC', 'ARM', 'MU', 'AMAT'],
      desc: 'Máxima exposición al ciclo de inversión de cómputo para Inteligencia Artificial.',
    },
    {
      id: 'crypto',
      name: 'Criptoactivos & Activos Digitales (24/7)',
      category: 'Cripto 24/7',
      tickers: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'AVAX-USD', 'LINK-USD', 'SUI-USD'],
      desc: 'Mercado continuo sin cierre de fin de semana con normalización de volatilidad.',
    },
    {
      id: 'finance',
      name: 'Banca Central & Finanzas Globales',
      category: 'Finanzas',
      tickers: ['JPM', 'BAC', 'GS', 'MS', 'WFC', 'C', 'V', 'MA', 'BLK', 'SCHW'],
      desc: 'Sensibilidad directa a diferenciales de tasas de interés y liquidez global.',
    },
    {
      id: 'energy',
      name: 'Energía, Metales & Materias Primas',
      category: 'Commodities',
      tickers: ['XOM', 'CVX', 'COP', 'SHEL', 'BP', 'GLD', 'SLV', 'USO', 'UNG', 'FCX'],
      desc: 'Cobertura macroeconómica contra inflación y choques geopolíticos.',
    },
  ]

  const currentUniverse = universes.find((u) => u.id === activeUniverse) || universes[0]

  // Embed TradingView Market Overview Widget (100% Free)
  useEffect(() => {
    if (!marketQuotesContainerRef.current) return
    marketQuotesContainerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      dateRange: '12M',
      showChart: true,
      locale: 'es',
      width: '100%',
      height: 600,
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      plotLineColorGrowing: 'rgba(48, 209, 88, 1)',
      plotLineColorFalling: 'rgba(255, 69, 58, 1)',
      gridLineColor: 'rgba(255, 255, 255, 0.04)',
      scaleFontColor: 'rgba(134, 134, 139, 1)',
      belowLineFillColorGrowing: 'rgba(48, 209, 88, 0.12)',
      belowLineFillColorFalling: 'rgba(255, 69, 58, 0.12)',
      symbolActiveColor: 'rgba(255, 255, 255, 0.1)',
      tabs: [
        {
          title: 'Índices Principales',
          symbols: [
            { s: 'FOREXCOM:SPXUSD', d: 'S&P 500 Index' },
            { s: 'FOREXCOM:NSXUSD', d: 'Nasdaq 100 Index' },
            { s: 'FOREXCOM:DJI', d: 'Dow Jones 30' },
            { s: 'INDEX:DEU40', d: 'DAX 40 Alemania' },
            { s: 'INDEX:NKY', d: 'Nikkei 225 Japón' }
          ]
        },
        {
          title: 'Mega-Caps Tecnológicas',
          symbols: [
            { s: 'NASDAQ:NVDA', d: 'NVIDIA' },
            { s: 'NASDAQ:AAPL', d: 'Apple' },
            { s: 'NASDAQ:MSFT', d: 'Microsoft' },
            { s: 'NASDAQ:GOOGL', d: 'Alphabet' },
            { s: 'NASDAQ:AMZN', d: 'Amazon' },
            { s: 'NASDAQ:META', d: 'Meta Platforms' },
            { s: 'NASDAQ:TSLA', d: 'Tesla' }
          ]
        },
        {
          title: 'Cripto & Futuros',
          symbols: [
            { s: 'BINANCE:BTCUSDT', d: 'Bitcoin / USDT' },
            { s: 'BINANCE:ETHUSDT', d: 'Ethereum / USDT' },
            { s: 'BINANCE:SOLUSDT', d: 'Solana / USDT' },
            { s: 'TVC:GOLD', d: 'Oro al Contado' },
            { s: 'TVC:USOIL', d: 'Petróleo WTI' },
            { s: 'TVC:US10Y', d: 'Yield Bono US 10 Años' }
          ]
        }
      ]
    })

    marketQuotesContainerRef.current.appendChild(script)
  }, [])

  // Embed TradingView Financial News Timeline Widget (100% Free)
  useEffect(() => {
    if (!newsContainerRef.current) return
    newsContainerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      feedMode: 'all_symbols',
      isTransparent: true,
      displayMode: 'regular',
      width: '100%',
      height: 600,
      colorTheme: 'dark',
      locale: 'es'
    })

    newsContainerRef.current.appendChild(script)
  }, [])

  // Embed TradingView Stock Screener Widget (100% Free)
  useEffect(() => {
    if (!screenerContainerRef.current) return
    screenerContainerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: 520,
      defaultColumn: 'overview',
      defaultScreen: 'most_capitalized',
      market: 'america',
      showToolbar: true,
      colorTheme: 'dark',
      isTransparent: true,
      locale: 'es'
    })

    screenerContainerRef.current.appendChild(script)
  }, [])

  const macroStats = [
    { label: 'S&P 500 Futures', value: '5,842.10', change: '+0.45%', positive: true },
    { label: 'Nasdaq 100 E-mini', value: '20,120.40', change: '+0.62%', positive: true },
    { label: 'US 10-Yr Yield', value: '4.182%', change: '+1.2 bps', positive: false },
    { label: 'VIX Volatility Index', value: '15.20', change: '-2.25%', positive: true },
    { label: 'DXY Dollar Index', value: '104.15', change: '+0.08%', positive: false },
    { label: 'Gold Spot (XAU/USD)', value: '$2,488.50', change: '+0.31%', positive: true },
    { label: 'Crude Oil (WTI)', value: '$72.60', change: '-0.45%', positive: false },
    { label: 'Bitcoin (BTC/USD)', value: '$64,320', change: '+1.85%', positive: true },
  ]

  return (
    <div className="w-full space-y-8 pb-12">
      {/* 1. Bloomberg Top Terminal Telemetry Header */}
      <div className="rounded-3xl bg-[#09090D] border border-white/[0.12] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Amber terminal top stripe */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/40 via-white/30 to-amber-500/40" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                TERMINAL BLOOMBERG // QUANTVIBE MACRO FEED
              </span>
              <span className="h-3 w-[1px] bg-white/20" />
              <span className="text-[11px] font-mono text-[#86868B]">100% GRATIS & EN VIVO</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-[-0.035em] leading-[1.08]">
              Mesa Macro Bloomberg <span className="text-[#86868B]">& Feed Global en Vivo</span>
            </h2>

            <p className="text-sm text-[#86868B] max-w-3xl leading-relaxed">
              Supervisión de liquidez mundial en tiempo real, índices interbancarios, curva de rendimientos y teletipo de noticias financieras de grado institucional sin costo de suscripción.
            </p>
          </div>

          {/* Terminal Command Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1 rounded-lg bg-black/60 border border-amber-500/30 text-amber-300 font-bold flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>QVB &lt;GO&gt;</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-white font-medium">
              <span>TOP5 &lt;GO&gt;</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-white font-medium">
              <span>NEWS &lt;GO&gt;</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-white font-medium">
              <span>VOL &lt;GO&gt;</span>
            </div>
          </div>
        </div>

        {/* Global Macro Quick Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-6">
          {macroStats.map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-2xl bg-[#0E0E14] border border-white/[0.06] hover:border-white/15 transition-all font-mono"
            >
              <div className="text-[10px] text-[#86868B] truncate mb-1">{stat.label}</div>
              <div className="text-sm font-bold text-white tracking-tight">{stat.value}</div>
              <div
                className={`text-[11px] font-semibold mt-0.5 ${
                  stat.positive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Configuración de Universos Dinámicos ("¿Solo se puede esos activos?") */}
      <div className="rounded-3xl bg-[#09090D] border border-white/[0.12] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs font-mono text-white mb-2">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>UNIVERSO CUANTITATIVO ILIMITADO</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ¿Solo se pueden esos activos? <span className="text-[#86868B]">No. Opera cualquier mercado.</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#86868B] mt-1 max-w-3xl leading-relaxed">
              El motor de QuantVibe no está acoplado a 10 acciones fijas. Puedes minar factores y generar portafolios autónomos para
              cualquier activo cotizado en Yahoo Finance, Binance o bolsas mundiales: acciones tecnológicas, criptoactivos 24/7, materias primas o el S&P 500 completo.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-medium self-start md:self-auto flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>config/pipeline.json Dinámico</span>
          </div>
        </div>

        {/* Universe Preset Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-6 mb-6">
          {universes.map((u) => {
            const isSelected = activeUniverse === u.id
            return (
              <button
                key={u.id}
                onClick={() => setActiveUniverse(u.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-lg font-semibold'
                    : 'bg-[#0E0E14] border-white/[0.08] text-[#A1A1A6] hover:border-white/20'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-mono block uppercase mb-1 ${isSelected ? 'text-black/60' : 'text-[#86868B]'}`}>
                    {u.category}
                  </span>
                  <div className={`text-sm font-bold tracking-tight mb-2 ${isSelected ? 'text-black' : 'text-white'}`}>
                    {u.name}
                  </div>
                  <div className={`text-xs line-clamp-2 leading-relaxed ${isSelected ? 'text-black/80' : 'text-[#86868B]'}`}>
                    {u.desc}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-1 font-mono text-[10px]">
                  {u.tickers.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className={`px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-black/10 text-black font-bold' : 'bg-white/[0.06] text-white'
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                  {u.tickers.length > 4 && (
                    <span className={isSelected ? 'text-black/60' : 'text-[#86868B]'}>
                      +{u.tickers.length - 4}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Active Universe Detail Strip & Custom Asset Input */}
        <div className="p-5 rounded-2xl bg-[#0E0E14] border border-white/[0.08] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-[#86868B]">
              TICKERS ACTIVOS PARA ESTE UNIVERSO ({currentUniverse.tickers.length} ACTIVOS):
            </div>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {currentUniverse.tickers.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.08] text-white border border-white/[0.12] font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Custom Asset Input Demo */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={customTickers}
                onChange={(e) => setCustomTickers(e.target.value)}
                placeholder="Ej: PLTR, ARM, COIN, BTC-USD..."
                className="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/[0.14] text-xs font-mono text-white placeholder-[#86868B] focus:outline-none focus:border-white/40"
              />
            </div>
            <button
              onClick={() => alert(`Universo personalizado configurado con: ${customTickers}. El pipeline ejecutará factor mining sobre estos activos.`)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono hover:bg-[#EAEAEA] transition-colors whitespace-nowrap"
            >
              Aplicar a Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* 3. Terminal Live Widescreen Multi-Column Stage (Market Overview + News Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Market Quotes & Charts (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#09090D] border border-white/[0.12] p-5 sm:p-6 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-white" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Resumen de Mercado Global en Tiempo Real
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              STREAMING DIRECTO
            </span>
          </div>

          <div ref={marketQuotesContainerRef} className="w-full min-h-[600px] overflow-hidden" />
        </div>

        {/* Right Column: Financial Breaking News & Wire (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#09090D] border border-white/[0.12] p-5 sm:p-6 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Teletipo de Noticias Financieras en Vivo
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#86868B]">
              Reuters • Bloomberg • CNBC Wire
            </span>
          </div>

          <div ref={newsContainerRef} className="w-full min-h-[600px] overflow-hidden" />
        </div>
      </div>

      {/* 4. Institutional Stock Screener Stage */}
      <div className="rounded-3xl bg-[#09090D] border border-white/[0.12] p-5 sm:p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-white" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Escáner Cuantitativo Multimercado (Wall Street Screener)
            </span>
          </div>
          <span className="text-xs font-mono text-[#86868B]">
            Filtro por Capitalización, PER, Flujo de Caja y Rendimiento Técnico
          </span>
        </div>

        <div ref={screenerContainerRef} className="w-full min-h-[520px] overflow-hidden" />
      </div>
    </div>
  )
}
