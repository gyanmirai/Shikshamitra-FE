'use client';

import type { Session } from 'next-auth';

import { SessionProvider } from 'next-auth/react';

type Props = {
  children: React.ReactNode;
  session?: Session | null;
};

const NextAuthSessionProvider = ({ children, session }: Props) => (
  <SessionProvider
    session={session ?? undefined}
    // Disable polling — we don't need to refetch the session on an interval.
    refetchInterval={5 * 60}
    // Don't refetch when the tab regains focus.
    refetchOnWindowFocus={false}
    // Avoid refetching when the browser comes back online.
    refetchWhenOffline={false}
  >
    {children}
  </SessionProvider>
);

export default NextAuthSessionProvider;
