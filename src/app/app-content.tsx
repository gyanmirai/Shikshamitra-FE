'use client';

import { useOffLine } from 'src/hooks/useOffLine';
import { NoInternetView } from 'src/sections/error';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AppContent({ children }: Props) {
  const isOffline = useOffLine();

  if (isOffline) {
    return <NoInternetView />;
  }

  return <>{children}</>;
}
