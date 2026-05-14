'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LeaveBalanceLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.leaveManagement.leaveBalance}>
    {children}
  </StudentPermissionGuard>
);

export default LeaveBalanceLayout;
