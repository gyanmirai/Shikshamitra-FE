'use client';

import StudentPermissionGuard from 'src/components/student-permission-guard';
import { securityGuardPermissions } from 'src/constants/security-gaurd-menu';

const GatePassStaffLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityGuardPermissions.gatePass.requestStaff}>
    {children}
  </StudentPermissionGuard>
);

export default GatePassStaffLayout;
