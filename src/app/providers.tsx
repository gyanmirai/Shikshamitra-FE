'use client';

import { SessionProvider } from 'next-auth/react';

const NextAuthSessionProvider = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
);

export default NextAuthSessionProvider;
