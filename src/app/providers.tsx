'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { publicAdmissionsPaths } from 'src/constants/public-admissions';

const NextAuthSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  if (pathname === publicAdmissionsPaths.registration) return <>{children}</>;
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
};

export default NextAuthSessionProvider;
