'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const DeductionComponentLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.payroll.settings.deductionComponents}>
    {children}
  </StudentPermissionGuard>
);

export default DeductionComponentLayout;
