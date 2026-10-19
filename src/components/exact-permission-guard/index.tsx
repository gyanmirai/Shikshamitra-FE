'use client';

import type { RootState } from 'src/redux/store';
import type { PermissionName } from 'src/utils/permissions';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { hasGrantedPermission } from 'src/utils/permissions';
import { SplashScreen } from 'src/components/loading-screen';

export default function ExactPermissionGuard({ children, permissionKey }: {
  children: React.ReactNode;
  permissionKey: PermissionName;
}) {
  const { permissions, loading, permissionsInitialized } = useSelector((state: RootState) => state.auth);
  if (loading || !permissionsInitialized) return <SplashScreen />;
  return hasGrantedPermission(permissions, permissionKey) ? children : <View403 />;
}
