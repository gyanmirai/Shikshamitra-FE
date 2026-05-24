'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { hrPermissions } from 'src/constants/hr-menus';
import { SplashScreen } from 'src/components/loading-screen';
import { hasGrantedPermission } from 'src/utils/permissions';

const HRLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  const hasPermission = hasGrantedPermission(permissions, hrPermissions.root);

  if (loading || !permissionsInitialized) return <SplashScreen />;
  return hasPermission ? children : <View403 />;
};

export default HRLayout;
