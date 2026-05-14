'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ExamTypesLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.examination.settings.examTypes}>
    {children}
  </StudentPermissionGuard>
);

export default ExamTypesLayout;
