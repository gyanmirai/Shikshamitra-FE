'use client';

import type React from 'react';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { SplashScreen } from '../loading-screen';

/**
 * AuthRouteLayout Component
 * Handles authentication and routing logic for protected routes
 * Redirects users based on authentication state and initial setup status
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 */
const AuthRouteLayout = ({ children }: { children: React.ReactNode }) => {
  // Get authentication state from Redux store

  const { loading, isAuthenticated, permissionsInitialized } = useSelector(
    (state: any) => state.auth
  );

  const session: any = useSession();
  const { data: sessionData, status } = session;

  // Initialize Next.js router for navigation
  const router = useRouter();

  useEffect(() => {
    const hasUsableSession =
      sessionData?.profile && sessionData?.accessToken && !sessionData?.error;

    if (status !== 'loading' && !hasUsableSession) {
      router.push('/login');
    }
  }, [status, sessionData, router]);

  const hasUsableSession = sessionData?.profile && sessionData?.accessToken && !sessionData?.error;

  if (status === 'loading' || (hasUsableSession && (loading || !permissionsInitialized))) {
    return <SplashScreen />;
  }

  if (hasUsableSession && isAuthenticated) {
    return children;
  }

  return null;
};

export default AuthRouteLayout;
