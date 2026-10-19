'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const FinanceDashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.dashboard}>
    {children}
  </ExactPermissionGuard>
);

export default FinanceDashboardLayout;
