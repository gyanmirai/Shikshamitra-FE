'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const ChargeManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.fees.charges}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default ChargeManagementLayout;
