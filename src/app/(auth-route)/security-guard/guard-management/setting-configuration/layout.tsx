'use client';

import StudentPermissionGuard from 'src/components/student-permission-guard';
import { securityGuardPermissions } from 'src/constants/security-gaurd-menu';

const ShiftConfigLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityGuardPermissions.guardManagement.shiftConfig}>
    {children}
  </StudentPermissionGuard>
);

export default ShiftConfigLayout;
