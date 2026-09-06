import React, { useState, useEffect, useRef } from 'react'
import { Globe, Activity, CheckCircle2 } from 'lucide-react'
import { BloombergNewsSection } from './BloombergNewsSection'
import { Btn, Eyebrow, Panel, Reveal, StatusDot, cn } from './ui'

/* Universe presets proving QuantVibe is not limited to 10 tickers */
const UNIVERSES = [
  {
    id: 'sp10',
    name: 'Mega-Cap Tech & S&P 10',
    category: 'Renta variable US',
    tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'XOM'],
    desc: 'Universo por defecto calibrado para factor mining Alpha158.',
  },
  {
    id: 'semis',
    name: 'Semiconductores & Hardware IA',
    category: 'Hardware & chips',
    tickers: ['NVDA', 'TSM', 'AMD', 'AVGO', 'ASML', 'QCOM', 'INTC', 'ARM', 'MU', 'AMAT'],
    desc: 'Máxima exposición al ciclo de inversión de cómputo para IA.',
  },
  {
    id: 'crypto',
    name: 'Criptoactivos 24/7',
    category: 'Cripto continuo',
    tickers: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'AVAX-USD', 'LINK-USD', 'SUI-USD'],
    desc: 'Mercado sin cierre con normalización de volatilidad.',
  },
  {
    id: 'finance',
    name: 'Banca & Finanzas Globales',
    category: 'Finanzas',
    tickers: ['JPM', 'BAC', 'GS', 'MS', 'WFC', 'C', 'V', 'MA', 'BLK', 'SCHW'],
    desc: 'Sensibilidad a diferenciales de tasas y liquidez global.',
  },
  {
    id: 'energy',
    name: 'Energía & Materias Primas',
    category: 'Commodities',
    tickers: ['XOM', 'CVX', 'COP', 'SHEL', 'BP', 'GLD', 'SLV', 'USO', 'UNG', 'FCX'],
    desc: 'Cobertura macro contra inflación y choques geopolíticos.',
  },
]

export const BloombergTerminal: React.FC = () => {
  const [activeUniverse, setActiveUniverse] = useState<string>('sp10')
  const [customTickers, setCustomTickers] = useState<string>('PLTR, SMCI, ARM, COIN, MSTR')
  const [customUniverseNotice, setCustomUniverseNotice] = useState<string | null>(null)

  const marketQuotesContainerRef = useRef<HTMLDivElement>(null)
  const screenerContainerRef = useRef<HTMLDivElement>(null)

  const handleApplyCustomTickers = () => {
    const cleaned = customTickers.trim()
    if (!cleaned) return
    setCustomUniverseNotice(
      `Previsualización registrada: ${cleaned}. Para minado real, edita config/pipeline.json — el pipeline lee ese archivo en cada ejecución.`
    )
    setTimeout(() => setCustomUniverseNotice(null), 7000)
  }

  const currentUniverse = UNIVERSES.find((u) => u.id === activeUniverse) || UNIVERSES[0]

  /* TradingView Market Overview widget — real streaming data */
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
            { s: 'INDEX:NKY', d: 'Nikkei 225 Japón' },
          ],
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
            { s: 'NASDAQ:TSLA', d: 'Tesla' },
          ],
        },
        {
          title: 'Cripto & Futuros',
          symbols: [
            { s: 'BINANCE:BTCUSDT', d: 'Bitcoin / USDT' },
            { s: 'BINANCE:ETHUSDT', d: 'Ethereum / USDT' },
            { s: 'BINANCE:SOLUSDT', d: 'Solana / USDT' },
            { s: 'TVC:GOLD', d: 'Oro al Contado' },
            { s: 'TVC:USOIL', d: 'Petróleo WTI' },
            { s: 'TVC:US10Y', d: 'Yield Bono US 10 Años' },
          ],
        },
      ],
    })

    marketQuotesContainerRef.current.appendChild(script)
  }, [])

  /* TradingView Stock Screener widget — real institutional scanner */
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
      locale: 'es',
    })

    screenerContainerRef.current.appendChild(script)
  }, [])

  return (
    <div className="w-full space-y-12 pb-12 font-sans">
      {/* 1. Editorial macro desk head */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Eyebrow>
            <span className="flex items-center gap-2">
              <StatusDot tone="warn" ping /> Terminal Bloomberg · macro desk en vivo
            </span>
          </Eyebrow>
          <h1 className="mt-3 font-sans text-4xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl">
            Mesa macro & feed <span className="text-[#86868B] font-semibold">global.</span>
          </h1>
          <p className="editorial-subhead mt-3 max-w-2xl text-sm leading-relaxed text-[#86868B]">
            Liquidez mundial en tiempo real, índices interbancarios, curva de rendimientos,
            teletipo de noticias de grado institucional y la señal oficial de Bloomberg Television.
          </p>
        </div>
        <span className="badge-terminal-neutral shrink-0 self-start rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] lg:self-auto">
          datos reales · 0 suscripciones
        </span>
      </div>

      {/* 2. Universe explorer — hairline rail cells */}
      <Reveal>
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#86868B]">
              Universos cuantitativos · el motor no está limitado a 10 activos
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#636366]">
              <CheckCircle2 className="h-3 w-3 text-[#30D158]" />
              config/pipeline.json dinámico
            </span>
          </div>

          <div className="grid grid-cols-1 border-l border-t border-white/[0.07] sm:grid-cols-2 lg:grid-cols-5">
            {UNIVERSES.map((u) => {
              const isSelected = activeUniverse === u.id
              return (
                <button
                  key={u.id}
                  onClick={() => setActiveUniverse(u.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'group flex flex-col justify-between border-b border-r border-white/[0.07] p-5 text-left transition-colors',
                    isSelected ? 'bg-white/[0.055]' : 'hover:bg-white/[0.02]'
                  )}
                >
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#636366]">
                      {u.category}
                    </span>
                    <div
                      className={cn(
                        'mt-1.5 text-sm font-bold tracking-tight',
                        isSelected ? 'text-white' : 'text-[#D2D2D7]'
                      )}
                    >
                      {u.name}
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-[#86868B]">{u.desc}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1 border-t border-white/[0.06] pt-3 font-mono text-[9px]">
                    {u.tickers.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className={cn(
                          'rounded px-1.5 py-0.5',
                          isSelected
                            ? 'bg-white/10 font-bold text-white'
                            : 'bg-white/[0.04] text-[#A1A1A6]'
                        )}
                      >
                        {t}
                      </span>
                    ))}
                    <span className="py-0.5 text-[#636366]">+{u.tickers.length - 4}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active universe strip + custom input */}
          <div className="mt-6 flex flex-col gap-5 border-y border-white/[0.07] py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#636366]">
                Universo activo · {currentUniverse.tickers.length} tickers
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {currentUniverse.tickers.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-white/[0.09] bg-white/[0.04] px-2 py-1 font-semibold text-[#D2D2D7] transition-colors hover:border-white/25 hover:text-white"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto">
              <input
                type="text"
                value={customTickers}
                onChange={(e) => setCustomTickers(e.target.value)}
                placeholder="PLTR, ARM, COIN, BTC-USD…"
                aria-label="Tickers personalizados"
                className="w-full rounded-full border border-white/[0.12] bg-black/50 px-4 py-2.5 font-mono text-xs text-white placeholder-[#636366] transition-colors focus:border-white/40 focus:outline-none lg:w-72"
              />
              <Btn variant="secondary" onClick={handleApplyCustomTickers} className="shrink-0">
                Previsualizar universo
              </Btn>
            </div>
          </div>

          {/* Honest local feedback (success state) */}
          {customUniverseNotice && (
            <div className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-[#30D158]/25 bg-[#30D158]/[0.06] px-4 py-3 font-mono text-xs text-[#30D158]">
              <span className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {customUniverseNotice}
              </span>
              <button
                onClick={() => setCustomUniverseNotice(null)}
                className="shrink-0 rounded px-2 py-0.5 transition-colors hover:bg-[#30D158]/15"
              >
                Descartar
              </button>
            </div>
          )}
        </div>
      </Reveal>

      {/* 3. Real-time global market stage */}
      <Reveal>
        <Panel
          eyebrow="Streaming directo · TradingView"
          title="Resumen de mercado global en tiempo real"
          right={
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#30D158]">
              <StatusDot tone="pos" ping /> Live feed
            </span>
          }
          bodyClass="p-0 sm:p-0"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-2.5">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#636366]">
              <Globe className="h-3.5 w-3.5" /> índices · megacaps · cripto · materias primas
            </span>
          </div>
          <div ref={marketQuotesContainerRef} className="w-full min-h-[600px] overflow-hidden" />
        </Panel>
      </Reveal>

      {/* 4. Official Bloomberg media ecosystem (single TV/news/podcast source) */}
      <BloombergNewsSection />

      {/* 5. Institutional screener stage */}
      <Reveal>
        <Panel
          eyebrow="Wall Street screener · TradingView"
          title="Escáner cuantitativo multimercado"
          right={
            <span className="hidden items-center gap-2 font-mono text-[10px] text-[#636366] sm:flex">
              <Activity className="h-3.5 w-3.5" /> capitalización · PER · flujo de caja · técnico
            </span>
          }
          bodyClass="p-0 sm:p-0"
        >
          <div ref={screenerContainerRef} className="w-full min-h-[520px] overflow-hidden" />
        </Panel>
      </Reveal>
    </div>
  )
}
