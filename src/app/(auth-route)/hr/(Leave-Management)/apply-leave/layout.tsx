'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ApplyLeaveLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.leaveManagement.applyLeave}>
    {children}
  </StudentPermissionGuard>
);

export default ApplyLeaveLayout;
