'use client';

import { useUserTier } from '@/hooks/useUserTier';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

export function TierBadge() {
  const tier = useUserTier();

  const config =
    tier === 'enterprise' ? { variant: 'enterprise' as const, label: tier, glow: true } :
    tier === 'pro'        ? { variant: 'pro' as const, label: tier, glow: true } :
    tier === 'free'       ? { variant: 'outline' as const, label: tier, glow: false } :
                            { variant: 'warning' as const, label: tier, glow: false };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Badge
        variant={config.variant}
        aria-label={`Account tier: ${tier}`}
        glow={config.glow}
        className="uppercase tracking-wider text-xs"
      >
        {config.label}
      </Badge>
    </motion.div>
  );
}
