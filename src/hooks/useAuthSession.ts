import { useSelector } from 'react-redux';

/**
 * Drop-in replacement for NextAuth's `useSession()` that reads the session
 * from the Redux `auth` slice. The slice is kept in sync by `ReduxProvider`,
 * which is the single place in the app that subscribes to NextAuth via
 * `useSession()`. This avoids every consumer triggering a re-render / fetch
 * cycle of its own.
 *
 * Returned shape mirrors `useSession()` so existing call sites work:
 *   const session = useAuthSession();           // session.data, session.status
 *   const { data, status } = useAuthSession();
 *   const { data: session } = useAuthSession();
 */
export function useAuthSession() {
  const data = useSelector((state: any) => state.auth.session);
  const status = useSelector((state: any) => state.auth.status);
  return { data, status } as { data: any; status: 'authenticated' | 'unauthenticated' | 'loading' };
}

export default useAuthSession;
