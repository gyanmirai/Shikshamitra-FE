'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import { SplashScreen } from '../loading-screen';

const NormalRouteLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useSelector((state: any) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

  if (loading) {
    return <SplashScreen />;
  }

  if (!loading && user) {
    return null; // render nothing while redirect happens
  }

  return children;
};

export default NormalRouteLayout;
