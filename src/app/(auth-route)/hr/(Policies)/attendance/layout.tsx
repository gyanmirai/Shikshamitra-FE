'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AttendanceLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.policies.attendance}>
    {children}
  </StudentPermissionGuard>
);

export default AttendanceLayout;
