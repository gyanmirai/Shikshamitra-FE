'use client';

import type React from 'react';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import { SplashScreen } from '../loading-screen';

const AuthRouteLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useSelector((state: any) => state.auth);
  const router = useRouter();

  if (!loading && !user) {
    router.push('/login');
    return null;
  }
  if (loading) {
    return <SplashScreen />;
  }
  return children;
};

export default AuthRouteLayout;
