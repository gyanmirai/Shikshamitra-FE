'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const IncomeTrackingLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.accounts.income}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default IncomeTrackingLayout;
