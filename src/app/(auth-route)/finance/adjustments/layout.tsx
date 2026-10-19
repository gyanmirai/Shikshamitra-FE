'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const AdjustmentLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.fees.adjustment}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default AdjustmentLayout;
