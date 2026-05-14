'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const TakeAttendanceLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.attendance.markAttendance}>
    {children}
  </StudentPermissionGuard>
);

export default TakeAttendanceLayout;
