'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { UserContext } from './UserContext';
import type { UserSession, UserTier } from '../lib/types';
import { auth } from '../lib/firebase';
import { getStoredProfile, setStoredProfile, type StoredProfile } from '../lib/firebase-session';

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
    // Hydrate the actual tier and Firebase profile the client persisted.
    if (session.tier === 'guest') {
      setCurrent(session);
      return;
    }

    const storedTier = localStorage.getItem('salam_user_tier') as UserTier | null;
    const tier = storedTier && VALID_TIERS.includes(storedTier) ? storedTier : session.tier;
    const storedProfile = getStoredProfile();

    const hydrate = (profile: StoredProfile, id = session.id) => {
      setCurrent({
        ...session,
        id,
        tier,
        name: profile.name ?? session.name,
        photoURL: profile.photoURL ?? session.photoURL,
      });
    };

    hydrate(storedProfile);

    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) return;
      const firebaseProfile = {
        name: user.displayName ?? storedProfile.name,
        photoURL: user.photoURL ?? storedProfile.photoURL,
      };

      setStoredProfile(firebaseProfile);
      hydrate(firebaseProfile, user.uid);
    });

    return unsubscribe;
  }, [session]);

  return (
    <UserContext.Provider value={current}>
      {children}
    </UserContext.Provider>
  );
}
