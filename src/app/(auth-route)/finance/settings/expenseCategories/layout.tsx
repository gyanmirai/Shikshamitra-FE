'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const ExpenseCategoryLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.accounts.settings.expenseCategory}>
    {children}
  </ExactPermissionGuard>
);

export default ExpenseCategoryLayout;
