'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const FinanceReportsLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.reports}>
    {children}
  </ExactPermissionGuard>
);

export default FinanceReportsLayout;
