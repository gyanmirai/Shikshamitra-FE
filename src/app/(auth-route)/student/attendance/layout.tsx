'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AttendanceLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.attendance.root}>
    {children}
  </StudentPermissionGuard>
);

export default AttendanceLayout;
