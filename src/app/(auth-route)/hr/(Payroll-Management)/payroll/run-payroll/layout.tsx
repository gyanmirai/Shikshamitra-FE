'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const RunPayrollLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.payroll.runPayroll}>
    {children}
  </StudentPermissionGuard>
);

export default RunPayrollLayout;
