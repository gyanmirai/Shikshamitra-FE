'use client';

import type React from 'react';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

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
  const { user, loading } = useSelector((state: any) => state.auth);

  // Initialize Next.js router for navigation
  const router = useRouter();

  // Flag to check if initial application setup is complete
  const isCompleteInitialSetup = true; // TODO: get this from redux store

  if (!isCompleteInitialSetup) {
    router.push('/initial-setup');
    return null;
  }

  // if (!loading && !user) {
  //   router.push('/login');
  //   return null;
  // }

  if (loading) {
    return <SplashScreen />;
  }

  return children;
};

export default AuthRouteLayout;
