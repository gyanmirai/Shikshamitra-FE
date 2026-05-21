'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ExpenseTrackingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.accounts.expense}>
    {children}
  </StudentPermissionGuard>
);

export default ExpenseTrackingLayout;
