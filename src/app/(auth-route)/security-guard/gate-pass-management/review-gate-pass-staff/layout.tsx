'use client';

import StudentPermissionGuard from 'src/components/student-permission-guard';
import { securityGuardPermissions } from 'src/constants/security-gaurd-menu';

const ReviewGatePassStaffLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityGuardPermissions.gatePass.reviewRequestStaff}>
    {children}
  </StudentPermissionGuard>
);

export default ReviewGatePassStaffLayout;
