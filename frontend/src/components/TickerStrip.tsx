'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';

const STOCK_ITEMS = [
  { symbol: 'AAPL', price: '+1.2%', positive: true },
  { symbol: 'TSLA', price: '-0.8%', positive: false },
  { symbol: 'NVDA', price: '+2.4%', positive: true },
  { symbol: 'BTC', price: '+3.1%', positive: true },
  { symbol: 'ETH', price: '-1.5%', positive: false },
  { symbol: 'TASI', price: '+0.6%', positive: true },
  { symbol: 'EGX30', price: '+0.9%', positive: true },
  { symbol: 'ADX', price: '-0.3%', positive: false },
  { symbol: 'MSFT', price: '+1.8%', positive: true },
  { symbol: 'GOOGL', price: '+0.4%', positive: true },
  { symbol: 'AMZN', price: '-0.2%', positive: false },
  { symbol: 'META', price: '+1.1%', positive: true },
];

export function TickerStrip() {
  const stripRef = useRef<HTMLDivElement>(null);
  const locale   = useLocale();

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    // Clone items for seamless loop
    const items = strip.querySelectorAll('.ticker-item');
    items.forEach(item => {
      const clone = item.cloneNode(true);
      strip.appendChild(clone);
    });
  }, []);

  return (
    <div className="w-full overflow-hidden py-3 border-y border-[#2A2A2A] bg-[#0a0a0a]/80 backdrop-blur-sm">
      <div
        ref={stripRef}
        className="flex gap-8 animate-[ticker-scroll_30s_linear_infinite] whitespace-nowrap"
        style={{ width: 'max-content' }}
      >
        {STOCK_ITEMS.map((item, i) => (
          <a
            key={i}
            href={`/${locale}/stock/${item.symbol}`}
            className="ticker-item flex items-center gap-2 text-sm font-mono hover:opacity-80 transition-opacity"
            tabIndex={-1}
            aria-hidden="true"
          >
            <span className="text-white font-medium">{item.symbol}</span>
            <span className={item.positive ? 'text-[#00E676]' : 'text-[#FF1744]'}>
              {item.price}
            </span>
            <span className="text-[#2A2A2A] mx-2">|</span>
          </a>
        ))}
      </div>
    </div>
  );
}
