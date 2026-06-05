'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const PayrollLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.policies.payroll}>
    {children}
  </StudentPermissionGuard>
);

export default PayrollLayout;
