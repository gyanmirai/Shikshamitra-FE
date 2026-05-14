'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LeaveTypeLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.leaveManagement.setting.leaveType}>
    {children}
  </StudentPermissionGuard>
);

export default LeaveTypeLayout;
