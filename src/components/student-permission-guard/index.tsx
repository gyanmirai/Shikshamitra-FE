'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { SplashScreen } from 'src/components/loading-screen';
import { hasGrantedPermission } from 'src/utils/permissions';

interface Props {
  children: React.ReactNode;
  permissionKey: string | string[];
}

const StudentPermissionGuard = ({ children, permissionKey }: Props) => {
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  const hasPermission = Array.isArray(permissionKey)
    ? permissionKey.some((key) => hasGrantedPermission(permissions, key))
    : hasGrantedPermission(permissions, permissionKey);
  if (loading || !permissionsInitialized) return <SplashScreen />;
  return hasPermission ? children : <View403 />;
};

export default StudentPermissionGuard;
