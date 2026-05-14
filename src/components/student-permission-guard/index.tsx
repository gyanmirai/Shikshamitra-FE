'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';

interface Props {
  children: React.ReactNode;
  permissionKey: string;
}

const StudentPermissionGuard = ({ children, permissionKey }: Props) => {
  const { permissions } = useSelector((state: RootState) => state.auth);

  const hasPermission = permissions.find(
    (perm: any) => perm.name === permissionKey || perm.name === `${permissionKey}.View`
  )?.isGranted;
  return hasPermission ? children : <View403 />;
};

export default StudentPermissionGuard;
