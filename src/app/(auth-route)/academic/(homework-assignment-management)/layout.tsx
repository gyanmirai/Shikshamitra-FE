'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HomeworkGroupLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.homework.root}>
    {children}
  </StudentPermissionGuard>
);

export default HomeworkGroupLayout;
