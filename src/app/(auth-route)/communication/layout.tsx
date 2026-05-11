'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { communicationPermissions } from 'src/constants/comminication-menu';

const CommunicationLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { permissions } = useSelector((state: RootState) => state.auth);

  const hasPermission = permissions.find(
    (perm: any) => perm.name === communicationPermissions.root
  )?.isGranted;

  return hasPermission ? children : <View403 />;
};

export default CommunicationLayout;
