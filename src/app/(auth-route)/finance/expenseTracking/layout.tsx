'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const ExpenseTrackingLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.accounts.expense}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default ExpenseTrackingLayout;
