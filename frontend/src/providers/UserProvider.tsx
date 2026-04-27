import { getUserFromCookie } from '../lib/auth';
import UserProviderClient from './UserProviderClient';

export { UserContext } from './UserContext';

// ---------------------------------------------------------------------------
// Server Component — reads cookie, passes session to client wrapper
// ---------------------------------------------------------------------------
export default async function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getUserFromCookie();

  return (
    <UserProviderClient session={session}>
      {children}
    </UserProviderClient>
  );
}
