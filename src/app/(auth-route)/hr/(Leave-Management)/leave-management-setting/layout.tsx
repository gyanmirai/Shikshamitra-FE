'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LeaveManagementSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.leaveManagement.setting.root}>
    {children}
  </StudentPermissionGuard>
);

export default LeaveManagementSettingLayout;
