'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { hasGrantedPermission } from 'src/utils/permissions';
import { SplashScreen } from 'src/components/loading-screen';

export default function Layout({ children }: { children: ReactNode }) {
  const { permissions, loading, permissionsInitialized } = useSelector((state: RootState) => state.auth);
  if (loading || !permissionsInitialized) return <SplashScreen />;
  return hasGrantedPermission(permissions, 'Students.Records.Certificates.View') || hasGrantedPermission(permissions, 'Students.Records.StudentICard.View') ? children : <View403 />;
}
