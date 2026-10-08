'use client';

import type { RootState } from 'src/redux/store';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { hostTenantPath } from 'src/constants/host-tenant-menu';

import { SplashScreen } from '../loading-screen';

const NormalRouteLayout = ({ children }: { children: React.ReactNode }) => {
  const session: any = useSession();
  const { data: sessionData, status } = session;
  const router = useRouter();
  const { sessionContext, permissionsInitialized, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (
      status === 'authenticated' &&
      sessionData?.profile &&
      sessionData?.accessToken &&
      !sessionData?.error &&
      user?.sub === sessionData.profile.sub &&
      permissionsInitialized &&
      sessionContext
    ) {
      router.replace(sessionContext.accountMode === 'host' ? hostTenantPath : '/dashboard');
    }
  }, [
    status,
    sessionData?.profile,
    sessionData?.accessToken,
    sessionData?.error,
    router,
    permissionsInitialized,
    sessionContext,
    user?.sub,
  ]);

  if (status === 'loading') {
    return <SplashScreen />;
  }

  if (
    status === 'authenticated' &&
    sessionData?.profile &&
    sessionData?.accessToken &&
    !sessionData?.error
  ) {
    return null; // render nothing while redirect happens
  }

  return children;
};

export default NormalRouteLayout;
