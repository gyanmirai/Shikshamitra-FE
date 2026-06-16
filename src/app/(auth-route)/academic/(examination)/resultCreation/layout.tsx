'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ResultCreationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.examination.resultCreation}>
    {children}
  </StudentPermissionGuard>
);

export default ResultCreationLayout;
