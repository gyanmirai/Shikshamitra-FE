'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { SplashScreen } from '../loading-screen';

const NormalRouteLayout = ({ children }: { children: React.ReactNode }) => {
  const session: any = useSession();
  const { data: sessionData, status } = session;
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && sessionData?.profile) {
      router.push('/dashboard');
    }
  }, [status, sessionData?.profile, router]);

  if (status === 'loading') {
    return <SplashScreen />;
  }

  if (status !== 'loading' && sessionData?.profile) {
    return null; // render nothing while redirect happens
  }

  return children;
};

export default NormalRouteLayout;
