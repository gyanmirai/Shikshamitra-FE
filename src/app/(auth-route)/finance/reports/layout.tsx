'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const FinanceReportsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.reports}>
    {children}
  </StudentPermissionGuard>
);

export default FinanceReportsLayout;
