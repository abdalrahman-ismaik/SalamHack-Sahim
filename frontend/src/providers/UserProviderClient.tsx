'use client';

import { useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import type { UserSession, UserTier } from '../lib/types';

const VALID_TIERS: UserTier[] = ['free', 'pro', 'enterprise'];

export default function UserProviderClient({
  session,
  children,
}: {
  session: UserSession;
  children: React.ReactNode;
}) {
  const [current, setCurrent] = useState<UserSession>(session);

  useEffect(() => {
    // Server returns 'free' when cookie exists but isn't a real JWT.
    // Hydrate the actual tier the client persisted in localStorage.
    if (session.tier === 'guest') return;
    const stored = localStorage.getItem('salam_user_tier') as UserTier | null;
    if (stored && VALID_TIERS.includes(stored)) {
      setCurrent(prev => ({ ...prev, tier: stored }));
    }
  }, [session.tier]);

  return (
    <UserContext.Provider value={current}>
      {children}
    </UserContext.Provider>
  );
}
