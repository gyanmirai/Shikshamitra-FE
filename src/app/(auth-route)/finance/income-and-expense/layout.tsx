'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const IncomeExpenseLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.accounts.root}>
    {children}
  </StudentPermissionGuard>
);

export default IncomeExpenseLayout;
