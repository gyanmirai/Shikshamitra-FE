'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { studentPermissions } from 'src/constants/student-menu';

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { permissions } = useSelector((state: RootState) => state.auth);

  console.log(studentPermissions.root, 'permissions', permissions);

  const hasPermission = permissions.find(
    (perm: any) => perm.name === studentPermissions.root
  )?.isGranted;

  return hasPermission ? children : <View403 />;
};

export default StudentLayout;
