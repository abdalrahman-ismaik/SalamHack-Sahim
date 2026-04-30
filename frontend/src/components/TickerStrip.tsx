'use client';

import { useTranslations } from 'next-intl';

const STOCK_ITEMS = [
  { symbol: 'AAPL', price: '+1.2%', positive: true, halal: 'Halal' },
  { symbol: 'TSLA', price: '-0.8%', positive: false, halal: 'Halal' },
  { symbol: 'NVDA', price: '+2.4%', positive: true, halal: 'PurificationRequired' },
  { symbol: 'BTC', price: '+3.1%', positive: true, halal: 'NonHalal' },
  { symbol: 'ETH', price: '-1.5%', positive: false, halal: 'Halal' },
  { symbol: 'TASI', price: '+0.6%', positive: true, halal: 'Halal' },
  { symbol: 'EGX30', price: '+0.9%', positive: true, halal: 'Halal' },
  { symbol: 'ADX', price: '-0.3%', positive: false, halal: 'Halal' },
  { symbol: 'MSFT', price: '+1.8%', positive: true, halal: 'Halal' },
  { symbol: 'GOOGL', price: '+0.4%', positive: true, halal: 'Halal' },
  { symbol: 'AMZN', price: '-0.2%', positive: false, halal: 'PurificationRequired' },
  { symbol: 'META', price: '+1.1%', positive: true, halal: 'Halal' },
];

const HALAL_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  Halal: { bg: 'bg-[#00E676]/10', text: 'text-[#00E676]', icon: '✓' },
  PurificationRequired: { bg: 'bg-[#FFB300]/10', text: 'text-[#FFB300]', icon: '!' },
  NonHalal: { bg: 'bg-[#FF1744]/10', text: 'text-[#FF1744]', icon: '×' },
  Unknown: { bg: 'bg-white/10', text: 'text-white/55', icon: '?' },
};

export interface TickerStripProps {
  onTickerClick?: (symbol: string) => void;
}

export function TickerStrip({ onTickerClick }: TickerStripProps) {
  const t = useTranslations('dashboard');

  const tickerItems = [...STOCK_ITEMS, ...STOCK_ITEMS];

  const handleClick = (symbol: string) => {
    if (onTickerClick) {
      onTickerClick(symbol);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, symbol: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(symbol);
    }
  };

  return (
    <div className="w-full overflow-hidden border-y border-white/10 bg-[#080808]/82 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
      <div
        className="flex animate-[ticker-scroll_60s_linear_infinite] gap-3 whitespace-nowrap hover:[animation-play-state:paused]"
        style={{ width: 'max-content' }}
      >
        {tickerItems.map((item, i) => {
          const halalStyle = HALAL_COLORS[item.halal] || HALAL_COLORS.Halal;
          
          return (
            <div
              key={i}
              role="button"
              data-symbol={item.symbol}
              tabIndex={0}
              onClick={() => handleClick(item.symbol)}
              onKeyDown={(e) => handleKeyDown(e, item.symbol)}
              className="ticker-item group flex cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-white/[0.025] px-3 py-2 transition-all hover:border-[#C5A059]/25 hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              title={t('ticker.clickToView', { symbol: item.symbol })}
            >
              {/* Stock symbol + price */}
              <div className="flex items-center gap-2 text-sm font-mono">
                <span className="text-white font-medium">{item.symbol}</span>
                <span className={item.positive ? 'text-[#00E676]' : 'text-[#FF1744]'}>
                  {item.price}
                </span>
              </div>

              {/* Halal badge with accessible tooltip */}
              <div className="relative group/badge">
                <div
                  id={`halal-badge-${item.symbol}-${i}`}
                  aria-describedby={`halal-tooltip-${item.symbol}-${i}`}
                  tabIndex={0}
                  className={`${halalStyle.bg} ${halalStyle.text} flex cursor-help items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold opacity-75 transition-opacity group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]`}
                >
                  <span>{halalStyle.icon}</span>
                </div>
                <div
                  id={`halal-tooltip-${item.symbol}-${i}`}
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-center text-xs text-white/80 opacity-0 transition-opacity group-hover/badge:opacity-100 group-focus-within/badge:opacity-100 whitespace-normal"
                >
                  {t('disclaimer.halal')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
