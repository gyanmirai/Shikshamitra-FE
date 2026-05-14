'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HomeworkTypesLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.homework.settings.homeworkTypes}>
    {children}
  </StudentPermissionGuard>
);

export default HomeworkTypesLayout;
