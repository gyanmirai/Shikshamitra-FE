'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LeaveCenterLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.leaveManagement.leaveCenter}>
    {children}
  </StudentPermissionGuard>
);

export default LeaveCenterLayout;
