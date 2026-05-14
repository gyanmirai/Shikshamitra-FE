'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CurriculumGroupLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.curriculum.root}>
    {children}
  </StudentPermissionGuard>
);

export default CurriculumGroupLayout;
