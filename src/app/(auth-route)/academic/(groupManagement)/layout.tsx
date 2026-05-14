'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const GroupManagementGroupLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.groupManagement.root}>
    {children}
  </StudentPermissionGuard>
);

export default GroupManagementGroupLayout;
