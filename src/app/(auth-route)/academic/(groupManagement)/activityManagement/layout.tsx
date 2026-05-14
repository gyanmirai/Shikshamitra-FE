'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ActivityManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.groupManagement.activityManagement}>
    {children}
  </StudentPermissionGuard>
);

export default ActivityManagementLayout;
