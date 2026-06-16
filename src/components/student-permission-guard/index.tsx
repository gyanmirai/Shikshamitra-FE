'use client';

import type { RootState } from 'src/redux/store';
import type { PermissionName } from 'src/utils/permissions';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { SplashScreen } from 'src/components/loading-screen';
import { hasGrantedPermission } from 'src/utils/permissions';

interface Props {
  children: React.ReactNode;
  permissionKey: PermissionName;
}

const StudentPermissionGuard = ({ children, permissionKey }: Props) => {
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  const hasPermission = hasGrantedPermission(permissions, permissionKey);
  if (loading || !permissionsInitialized) return <SplashScreen />;
  return hasPermission ? children : <View403 />;
};

export default StudentPermissionGuard;
