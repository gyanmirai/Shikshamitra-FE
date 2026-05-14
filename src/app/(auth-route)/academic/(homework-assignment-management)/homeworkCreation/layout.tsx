'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HomeworkCreationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.homework.learningTasks}>
    {children}
  </StudentPermissionGuard>
);

export default HomeworkCreationLayout;
