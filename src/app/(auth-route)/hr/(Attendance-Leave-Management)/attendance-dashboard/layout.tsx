'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AttendanceDashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={`${hrPermissions.attendance.dashboard}.View`}>
    {children}
  </StudentPermissionGuard>
);

export default AttendanceDashboardLayout;
