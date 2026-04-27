'use client';

import { useContext, useEffect } from 'react';
import { UserContext } from '../providers/UserContext';
import type { UserTier } from '../lib/types';

/**
 * Returns the current user's tier. Never returns null —
 * unauthenticated visitors get 'guest'.
 */
export function useUserTier(): UserTier {
  const session = useContext(UserContext);

  useEffect(() => {
    console.debug('[useUserTier] tier=', session.tier);
  }, [session.tier]);

  return session.tier;
}
