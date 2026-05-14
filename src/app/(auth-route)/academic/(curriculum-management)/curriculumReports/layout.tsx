'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CurriculumReportsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.curriculum.reports}>
    {children}
  </StudentPermissionGuard>
);

export default CurriculumReportsLayout;
