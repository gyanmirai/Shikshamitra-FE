import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AttendanceSettingLayout = ({ children }: { children: ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.attendance.settings.root}>
    {children}
  </StudentPermissionGuard>
);

export default AttendanceSettingLayout;
