'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HomeworkReportsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.homework.reports}>
    {children}
  </StudentPermissionGuard>
);

export default HomeworkReportsLayout;
