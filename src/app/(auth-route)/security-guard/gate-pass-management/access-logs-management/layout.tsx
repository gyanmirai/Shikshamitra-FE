'use client';

import StudentPermissionGuard from 'src/components/student-permission-guard';
import { securityGuardPermissions } from 'src/constants/security-gaurd-menu';

const AccessLogsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityGuardPermissions.gatePass.accessLogs}>
    {children}
  </StudentPermissionGuard>
);

export default AccessLogsLayout;
