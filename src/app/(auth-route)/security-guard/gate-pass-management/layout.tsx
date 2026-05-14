'use client';

import StudentPermissionGuard from 'src/components/student-permission-guard';
import { securityGuardPermissions } from 'src/constants/security-gaurd-menu';

const GatePassMgmtLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityGuardPermissions.gatePass.root}>
    {children}
  </StudentPermissionGuard>
);

export default GatePassMgmtLayout;
