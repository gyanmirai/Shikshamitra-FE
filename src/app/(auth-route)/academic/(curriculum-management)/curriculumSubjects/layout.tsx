'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CurriculumSubjectsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.curriculum.subjectsAssignment}>
    {children}
  </StudentPermissionGuard>
);

export default CurriculumSubjectsLayout;
