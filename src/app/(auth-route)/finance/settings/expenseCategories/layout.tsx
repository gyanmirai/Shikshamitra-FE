'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ExpenseCategoryLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.accounts.settings.expenseCategory}>
    {children}
  </StudentPermissionGuard>
);

export default ExpenseCategoryLayout;
