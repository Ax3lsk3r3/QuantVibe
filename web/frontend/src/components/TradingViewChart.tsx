import React, { useEffect, useRef, useState } from 'react'
import { Segmented, StatusDot } from './ui'

interface TradingViewChartProps {
  initialSymbol?: string
  availableSymbols?: string[]
  className?: string
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  initialSymbol = 'TSLA',
  availableSymbols = ['TSLA', 'NVDA', 'AAPL', 'META', 'XOM'],
  className = '',
}) => {
  const [selectedSymbolOverride, setSelectedSymbolOverride] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeSymbol = selectedSymbolOverride || initialSymbol

  const normalizeSymbol = (sym: string) => {
    if (sym.includes(':')) return sym
    if (sym === 'XOM') return 'NYSE:XOM'
    if (sym.includes('USDT') || sym === 'BTC' || sym === 'ETH') return `BINANCE:${sym}`
    return `NASDAQ:${sym}`
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container__widget'
    widgetContainer.style.height = '100%'
    widgetContainer.style.width = '100%'
    container.appendChild(widgetContainer)

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
      backgroundColor: '#050507',
      gridColor: 'rgba(255, 255, 255, 0.04)',
      hide_side_toolbar: false,
      studies: ['STD;SMA', 'STD;RSI'],
    })

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [activeSymbol])

  return (
    <div
      className={`glass-panel specular-hairline relative overflow-hidden rounded-2xl ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <StatusDot tone="pos" ping />
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F7]">
              Gráfica en vivo · TradingView
            </h3>
            <p className="font-mono text-[10px] text-[#636366]">
              velas, volumen, SMA y RSI · activo:{' '}
              <span className="font-bold text-[#A1A1A6]">{normalizeSymbol(activeSymbol)}</span>
            </p>
          </div>
        </div>

        <Segmented
          size="sm"
          layoutId="chartSymbol"
          value={activeSymbol}
          onChange={setSelectedSymbolOverride}
          options={availableSymbols.map((sym) => ({ id: sym, label: sym }))}
        />
      </div>

      <div className="relative h-[480px] w-full bg-[#030304] lg:h-[540px]">
        <div ref={containerRef} className="tradingview-widget-container h-full w-full" />
      </div>
    </div>
  )
}
