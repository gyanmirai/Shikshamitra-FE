'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const SubjectCreationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.curriculum.settings.subjectsCreation}>
    {children}
  </StudentPermissionGuard>
);

export default SubjectCreationLayout;
