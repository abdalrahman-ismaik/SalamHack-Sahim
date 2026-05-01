'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { UserContext } from './UserContext';
import type { UserSession } from '../lib/types';
import { auth } from '../lib/firebase';
import {
  getStoredTier,
  getStoredProfile,
  setStoredTier,
  setStoredProfile,
  type ClientTier,
  type StoredProfile,
} from '../lib/firebase-session';
import { ensureUserDocument, getUserProfileDocument } from '../lib/firestore-user';

const VALID_TIERS: ClientTier[] = ['free', 'pro', 'enterprise'];

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

    const fallbackTier: ClientTier =
      VALID_TIERS.includes(session.tier as ClientTier)
        ? (session.tier as ClientTier)
        : getStoredTier();
    const storedProfile = getStoredProfile();

    const hydrate = (profile: StoredProfile, id = session.id, tier = fallbackTier) => {
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

      void (async () => {
        const firebaseProfile = {
          name: user.displayName ?? storedProfile.name,
          photoURL: user.photoURL ?? storedProfile.photoURL,
        };

        setStoredProfile(firebaseProfile);

        try {
          await ensureUserDocument(user, { locale: session.locale });
          const profile = await getUserProfileDocument(user.uid);
          const trustedTier: ClientTier =
            profile?.tier && VALID_TIERS.includes(profile.tier)
              ? profile.tier
              : fallbackTier;

          setStoredTier(trustedTier);
          hydrate(
            {
              name: profile?.name ?? firebaseProfile.name,
              photoURL: profile?.photoURL ?? firebaseProfile.photoURL,
            },
            user.uid,
            trustedTier,
          );
        } catch (error) {
          console.warn('[UserProviderClient] Firestore profile hydration failed:', error);
          hydrate(firebaseProfile, user.uid, fallbackTier);
        }
      })();
    });

    return unsubscribe;
  }, [session]);

  return (
    <UserContext.Provider value={current}>
      {children}
    </UserContext.Provider>
  );
}
