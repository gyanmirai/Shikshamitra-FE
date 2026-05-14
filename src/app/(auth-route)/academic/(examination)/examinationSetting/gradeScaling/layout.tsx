'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const GradeScalingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.examination.settings.gradeScaling}>
    {children}
  </StudentPermissionGuard>
);

export default GradeScalingLayout;
