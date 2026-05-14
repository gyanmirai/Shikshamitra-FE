'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LeaveAbsentLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.attendance.leaveAndAbsent}>
    {children}
  </StudentPermissionGuard>
);

export default LeaveAbsentLayout;
