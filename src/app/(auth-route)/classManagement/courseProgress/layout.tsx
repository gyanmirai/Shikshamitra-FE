'use client';

import { classManagementPermissions } from 'src/constants/class-management';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CourseProgressLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={classManagementPermissions.chapters}>
    {children}
  </StudentPermissionGuard>
);

export default CourseProgressLayout;
