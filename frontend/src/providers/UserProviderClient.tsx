'use client';

import { UserContext } from './UserContext';
import type { UserSession } from '../lib/types';

export default function UserProviderClient({
  session,
  children,
}: {
  session: UserSession;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={session}>
      {children}
    </UserContext.Provider>
  );
}
