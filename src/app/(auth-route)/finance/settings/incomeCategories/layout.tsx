'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const IncomeCategoryLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.accounts.settings.incomeCategory}>
    {children}
  </StudentPermissionGuard>
);

export default IncomeCategoryLayout;
