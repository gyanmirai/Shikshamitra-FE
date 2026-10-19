'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const IncomeExpenseLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.accounts.root}>
    {children}
  </ExactPermissionGuard>
);

export default IncomeExpenseLayout;
