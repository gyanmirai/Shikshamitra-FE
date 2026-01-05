'use client';

import { SessionProvider } from 'next-auth/react';

const NextAuthSessionProvider = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider>{children}</SessionProvider>
);

export default NextAuthSessionProvider;
