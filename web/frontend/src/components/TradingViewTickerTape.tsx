import React, { useEffect, useRef } from 'react'

interface TradingViewTickerTapeProps {
  className?: string
}

export const TradingViewTickerTape: React.FC<TradingViewTickerTapeProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget on re-render to avoid duplicates
    containerRef.current.innerHTML = ''

    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container__widget'
    containerRef.current.appendChild(widgetContainer)

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'NASDAQ:AAPL', title: 'Apple' },
        { proName: 'NASDAQ:NVDA', title: 'Nvidia' },
        { proName: 'NASDAQ:TSLA', title: 'Tesla' },
        { proName: 'NASDAQ:META', title: 'Meta' },
        { proName: 'NYSE:XOM', title: 'Exxon' },
        { proName: 'NASDAQ:MSFT', title: 'Microsoft' },
        { proName: 'BINANCE:BTCUSDT', title: 'Bitcoin' },
        { proName: 'BINANCE:ETHUSDT', title: 'Ethereum' },
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
        { proName: 'NASDAQ:QQQ', title: 'Invesco QQQ' },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'es',
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className={`relative z-10 w-full overflow-hidden border-b border-white/[0.07] bg-[#030304]/90 backdrop-blur-md ${className}`}>
      <div ref={containerRef} className="tradingview-widget-container" />
    </div>
  )
}
