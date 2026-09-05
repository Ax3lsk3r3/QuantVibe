import React, { useEffect, useRef, useState } from 'react'
import { BarChart3, Sparkles } from 'lucide-react'

interface TradingViewChartProps {
  initialSymbol?: string
  availableSymbols?: string[]
  className?: string
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  initialSymbol = 'NASDAQ:TSLA',
  availableSymbols = ['TSLA', 'NVDA', 'AAPL', 'META', 'XOM', 'BTCUSDT'],
  className = '',
}) => {
  const [activeSymbol, setActiveSymbol] = useState(initialSymbol)
  const containerRef = useRef<HTMLDivElement>(null)

  const normalizeSymbol = (sym: string) => {
    if (sym.includes(':')) return sym
    if (sym === 'XOM') return 'NYSE:XOM'
    if (sym.includes('USDT') || sym === 'BTC' || sym === 'ETH') return `BINANCE:${sym}`
    return `NASDAQ:${sym}`
  }

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container__widget'
    widgetContainer.style.height = '100%'
    widgetContainer.style.width = '100%'
    containerRef.current.appendChild(widgetContainer)

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: normalizeSymbol(activeSymbol),
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'es',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      backgroundColor: '#0C0C10',
      gridColor: 'rgba(255, 255, 255, 0.04)',
      hide_side_toolbar: false,
      studies: ['STD;SMA', 'STD;RSI'],
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [activeSymbol])

  return (
    <div className={`rounded-3xl p-6 sm:p-7 bg-[#0C0C10] border border-white/[0.09] shadow-2xl relative overflow-hidden space-y-5 ${className}`}>
      {/* Top Hairline Specular Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.18] to-transparent pointer-events-none" />

      {/* Header with Symbol Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-[#F5F5F7] tracking-tight">
                Terminal Gráfica TradingView en Vivo
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
                LIVE FEED
              </span>
            </div>
            <p className="text-xs text-[#86868B] mt-0.5">
              Inspección interactiva de velas, volumen e indicadores para las señales de QuantVibe.
            </p>
          </div>
        </div>

        {/* Quick Symbol Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#1C1C1E] border border-white/[0.08]">
          {availableSymbols.map((sym) => {
            const isCurrent = activeSymbol.toUpperCase().includes(sym.toUpperCase())

            return (
              <button
                key={sym}
                onClick={() => setActiveSymbol(sym)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  isCurrent
                    ? 'bg-white text-black shadow-md'
                    : 'text-[#86868B] hover:text-[#F5F5F7]'
                }`}
              >
                {sym}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div className="w-full h-[520px] rounded-2xl overflow-hidden bg-[#070709] border border-white/[0.06] relative">
        <div ref={containerRef} className="tradingview-widget-container h-full w-full" />
      </div>

      {/* Chart Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#86868B] pt-2 border-t border-white/[0.06] gap-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-white/70" />
          <span>Cotizaciones y profundidad provistas por TradingView en tiempo real con 0 cuota de API.</span>
        </div>
        <div className="font-mono text-[#D1D1D6] flex items-center gap-1.5">
          <span>Activo seleccionado:</span>
          <span className="font-bold text-white px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1]">
            {activeSymbol}
          </span>
        </div>
      </div>
    </div>
  )
}
