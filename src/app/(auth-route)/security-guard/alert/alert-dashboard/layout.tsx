'use client';

import StudentPermissionGuard from 'src/components/student-permission-guard';
import { securityGuardPermissions } from 'src/constants/security-gaurd-menu';

const AlertDashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityGuardPermissions.alert.dashboard}>
    {children}
  </StudentPermissionGuard>
);

export default AlertDashboardLayout;
