'use client';

import StudentPermissionGuard from 'src/components/student-permission-guard';
import { securityGuardPermissions } from 'src/constants/security-gaurd-menu';

const LiveAlertLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityGuardPermissions.alert.live}>
    {children}
  </StudentPermissionGuard>
);

export default LiveAlertLayout;
