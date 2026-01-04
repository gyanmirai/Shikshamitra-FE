'use client';

import type React from 'react';

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

  const { loading } = useSelector((state: any) => state.auth);

  const session: any = useSession();
  const { data: sessionData, status } = session;

  // Initialize Next.js router for navigation
  const router = useRouter();

  // Flag to check if initial application setup is complete
  // const isCompleteInitialSetup = true; // TODO: get this from redux store

  // if (!isCompleteInitialSetup) {
  //   router.push('/initial-setup');
  //   return null;
  // }

  if (status !== 'loading' && !sessionData?.profile) {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || loading) {
    return <SplashScreen />;
  }

  if (sessionData?.profile) {
    return children;
  }

  return null;
};

export default AuthRouteLayout;
