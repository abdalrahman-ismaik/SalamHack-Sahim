import type { PricingPlan, PlanId } from './types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id:           'free',
    tier:         0,
    monthlyPrice: 0,
    highlighted:  false,
    ctaVariant:   'outline',
  },
  {
    id:           'pro',
    tier:         1,
    monthlyPrice: 9.9,
    highlighted:  true,
    ctaVariant:   'default',
  },
  {
    id:           'enterprise',
    tier:         2,
    monthlyPrice: null,
    highlighted:  false,
    ctaVariant:   'outline',
  },
];
