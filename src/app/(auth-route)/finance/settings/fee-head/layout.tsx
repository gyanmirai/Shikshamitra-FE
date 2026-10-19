'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const FeeHeadLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.fees.settings.feeHead}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default FeeHeadLayout;
