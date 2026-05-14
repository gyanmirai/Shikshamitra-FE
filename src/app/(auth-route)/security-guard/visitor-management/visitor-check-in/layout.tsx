'use client';

import StudentPermissionGuard from 'src/components/student-permission-guard';
import { securityGuardPermissions } from 'src/constants/security-gaurd-menu';

const VisitorCheckInLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityGuardPermissions.visitorManagement.checkpoint}>
    {children}
  </StudentPermissionGuard>
);

export default VisitorCheckInLayout;
