import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AttendanceNotificationLayout = ({ children }: { children: ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.notification}>
    {children}
  </StudentPermissionGuard>
);

export default AttendanceNotificationLayout;
