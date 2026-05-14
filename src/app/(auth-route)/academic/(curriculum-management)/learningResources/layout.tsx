'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LearningResourcesLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.curriculum.resources}>
    {children}
  </StudentPermissionGuard>
);

export default LearningResourcesLayout;
