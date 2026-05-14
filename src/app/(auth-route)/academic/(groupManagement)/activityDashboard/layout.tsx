'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ActivityDashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.groupManagement.dashboard}>
    {children}
  </StudentPermissionGuard>
);

export default ActivityDashboardLayout;
