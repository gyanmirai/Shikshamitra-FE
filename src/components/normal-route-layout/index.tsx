'use client';

import type { RootState } from 'src/redux/store';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { workspaceLanding } from 'src/redux/host-tenants/workspace-landing';
import { preserveNotificationLaunch } from 'src/hooks/notifications/notification-launch';

import { SplashScreen } from '../loading-screen';
import SessionInitializationError from '../auth-route-layout/session-initialization-error';

const NormalRouteLayout = ({ children }: { children: React.ReactNode }) => {
  const session: any = useSession();
  const { data: sessionData, status } = session;
  const router = useRouter();
  const {
    sessionContext,
    permissionsInitialized,
    permissions,
    user,
    initializationError,
    loading,
  } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (
      status === 'authenticated' &&
      sessionData?.profile?.sub &&
      sessionData?.accessToken &&
      !sessionData?.error &&
      user?.sub === sessionData.profile.sub &&
      user?.tenantid === sessionData.profile.tenantid &&
      permissionsInitialized &&
      sessionContext
    ) {
      const landing = workspaceLanding(sessionContext, permissions);
      const notificationLanding = window.location.pathname === '/login' &&
        sessionContext.accountMode === 'tenant' && sessionContext.setupCompleted === true;
      router.replace(notificationLanding ? preserveNotificationLaunch(landing, window.location.search) : landing);
    }
  }, [
    status,
    sessionData?.profile,
    sessionData?.accessToken,
    sessionData?.error,
    router,
    permissionsInitialized,
    permissions,
    sessionContext,
    user?.sub,
    user?.tenantid,
  ]);

  if (status === 'loading') {
    return <SplashScreen />;
  }

  if (
    status === 'authenticated' &&
    sessionData?.profile?.sub &&
    sessionData?.accessToken &&
    !sessionData?.error
  ) {
    if (initializationError && !loading) {
      return <SessionInitializationError message={initializationError} />;
    }
    return <SplashScreen />;
  }

  return children;
};

export default NormalRouteLayout;
