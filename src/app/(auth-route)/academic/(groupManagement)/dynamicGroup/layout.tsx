'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const DynamicGroupLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.groupManagement.dynamicGroup}>
    {children}
  </StudentPermissionGuard>
);

export default DynamicGroupLayout;
