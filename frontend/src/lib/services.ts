import type { ServiceCard } from './types';

export const SERVICES: ServiceCard[] = [
  {
    id:           'stock-screener',
    icon:         'Search',
    href:         '/stock',
    requiredTier: 'free',
    available:    true,
  },
  {
    id:           'halal-verdict',
    icon:         'CheckCircle',
    href:         '/stock',
    requiredTier: 'free',
    available:    true,
  },
  {
    id:           'risk-wizard',
    icon:         'Wand2',
    href:         '/tools/risk-wizard',
    requiredTier: 'free',
    available:    true,
  },
  {
    id:           'arima-forecast',
    icon:         'TrendingUp',
    href:         '/stock',
    requiredTier: 'pro',
    available:    true,
  },
  {
    id:           'portfolio-allocator',
    icon:         'PieChart',
    href:         '/tools/allocator',
    requiredTier: 'pro',
    available:    true,
  },
  {
    id:           'risk-dashboard',
    icon:         'ShieldAlert',
    href:         '/tools/risk',
    requiredTier: 'pro',
    available:    true,
  },
  {
    id:           'sector-explorer',
    icon:         'BarChart2',
    href:         '/sectors',
    requiredTier: 'pro',
    available:    true,
  },
  {
    id:           'news-agent',
    icon:         'Newspaper',
    href:         '/tools/news',
    requiredTier: 'free',
    available:    true,
  },
  {
    id:           'zakat-calculator',
    icon:         'Calculator',
    href:         '/tools/zakat',
    requiredTier: 'free',
    available:    true,
  },
];
