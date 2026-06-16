import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LeaveAbsentLayout = ({ children }: { children: ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.attendance.leaveAndAbsent}>
    {children}
  </StudentPermissionGuard>
);

export default LeaveAbsentLayout;
