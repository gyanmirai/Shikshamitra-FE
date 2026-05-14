'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AttendanceConfigLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.attendance.setting.attendanceConfiguration}>
    {children}
  </StudentPermissionGuard>
);

export default AttendanceConfigLayout;
