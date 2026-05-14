'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const PayrollConfigurationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.payroll.settings.payrollConfiguration}>
    {children}
  </StudentPermissionGuard>
);

export default PayrollConfigurationLayout;
