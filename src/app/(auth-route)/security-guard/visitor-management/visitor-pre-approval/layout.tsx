'use client';

import StudentPermissionGuard from 'src/components/student-permission-guard';
import { securityGuardPermissions } from 'src/constants/security-gaurd-menu';

const VisitorPreApprovalLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityGuardPermissions.visitorManagement.preApproval}>
    {children}
  </StudentPermissionGuard>
);

export default VisitorPreApprovalLayout;
