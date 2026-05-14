'use client';

import StudentPermissionGuard from 'src/components/student-permission-guard';
import { securityGuardPermissions } from 'src/constants/security-gaurd-menu';

const HandOverNotesLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityGuardPermissions.guardManagement.dutyOverview}>
    {children}
  </StudentPermissionGuard>
);

export default HandOverNotesLayout;
