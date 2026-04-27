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
    id:           'news-agent',
    icon:         'Newspaper',
    href:         '/stock',
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
    href:         '/stock',
    requiredTier: 'pro',
    available:    true,
  },
  {
    id:           'sector-explorer',
    icon:         'BarChart2',
    href:         '/stock',
    requiredTier: 'pro',
    available:    true,
  },
  {
    id:           'risk-dashboard',
    icon:         'ShieldAlert',
    href:         '/stock',
    requiredTier: 'pro',
    available:    true,
  },
  {
    id:           'live-monitoring',
    icon:         'Activity',
    href:         '/stock',
    requiredTier: 'pro',
    available:    false,
  },
];
