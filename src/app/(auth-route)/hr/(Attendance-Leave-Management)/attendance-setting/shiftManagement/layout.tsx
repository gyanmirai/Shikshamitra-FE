'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ShiftManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.attendance.setting.shiftManagement}>
    {children}
  </StudentPermissionGuard>
);

export default ShiftManagementLayout;
