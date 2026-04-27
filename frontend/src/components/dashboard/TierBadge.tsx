'use client';

import { useUserTier } from '@/hooks/useUserTier';
import { Badge } from '@/components/ui/Badge';

export function TierBadge() {
  const tier = useUserTier();

  const variant =
    tier === 'enterprise' ? 'success' :
    tier === 'pro'        ? 'default' :
    tier === 'free'       ? 'outline' :
                            'warning';

  return (
    <Badge
      variant={variant}
      aria-label={`Account tier: ${tier}`}
    >
      {tier}
    </Badge>
  );
}
