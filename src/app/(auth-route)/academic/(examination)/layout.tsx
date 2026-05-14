'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ExaminationGroupLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.examination.root}>
    {children}
  </StudentPermissionGuard>
);

export default ExaminationGroupLayout;
