'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const FinanceSettingsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.root}>
    {children}
  </StudentPermissionGuard>
);

export default FinanceSettingsLayout;
