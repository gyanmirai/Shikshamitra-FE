'use client';

import { classManagementPermissions } from 'src/constants/class-management';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ClassMgmtDashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={classManagementPermissions.dashboard}>
    {children}
  </StudentPermissionGuard>
);

export default ClassMgmtDashboardLayout;
