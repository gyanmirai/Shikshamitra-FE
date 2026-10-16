'use client';

import type React from 'react';
import type { RootState } from 'src/redux/store';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { isWrongWorkspace, workspaceLanding } from 'src/redux/host-tenants/workspace-landing';

import { SplashScreen } from '../loading-screen';
import SessionInitializationError from './session-initialization-error';

/**
 * AuthRouteLayout Component
 * Handles authentication and routing logic for protected routes
 * Redirects users based on authentication state and initial setup status
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 */
const AuthRouteLayout = ({ children }: { children: React.ReactNode }) => {
  // Get authentication state from Redux store

  const {
    loading,
    isAuthenticated,
    permissionsInitialized,
    sessionContext,
    user,
    initializationError,
  } = useSelector((state: RootState) => state.auth);

  const session: any = useSession();
  const { data: sessionData, status } = session;

  // Initialize Next.js router for navigation
  const router = useRouter();
  const pathname = usePathname();
  const verifiedIdentity =
    status === 'authenticated' &&
    isAuthenticated &&
    permissionsInitialized &&
    Boolean(sessionContext) &&
    user?.sub === sessionData?.profile?.sub &&
    user?.tenantid === sessionData?.profile?.tenantid &&
    Boolean(sessionData?.accessToken) &&
    !sessionData?.error;
  const wrongWorkspace = sessionContext ? isWrongWorkspace(sessionContext, pathname) : false;

  useEffect(() => {
    if (verifiedIdentity && wrongWorkspace && sessionContext)
      router.replace(workspaceLanding(sessionContext));
  }, [verifiedIdentity, wrongWorkspace, router, sessionContext]);

  useEffect(() => {
    const hasUsableSession =
      sessionData?.profile?.sub && sessionData?.accessToken && !sessionData?.error;

    if (status !== 'loading' && !hasUsableSession) {
      router.push('/login');
    }
  }, [status, sessionData, router]);

  const hasUsableSession =
    status === 'authenticated' &&
    sessionData?.profile?.sub &&
    sessionData?.accessToken &&
    !sessionData?.error;

  if (hasUsableSession && initializationError && !loading) {
    return <SessionInitializationError message={initializationError} />;
  }

  if (
    status === 'loading' ||
    (hasUsableSession &&
      (loading ||
        !permissionsInitialized ||
        user?.sub !== sessionData?.profile?.sub ||
        user?.tenantid !== sessionData?.profile?.tenantid ||
        wrongWorkspace))
  ) {
    return <SplashScreen />;
  }

  if (hasUsableSession && verifiedIdentity) {
    return children;
  }

  return null;
};

export default AuthRouteLayout;
