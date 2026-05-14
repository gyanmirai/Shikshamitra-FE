'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CourseSubjectsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.curriculum.chaptersManagement}>
    {children}
  </StudentPermissionGuard>
);

export default CourseSubjectsLayout;
