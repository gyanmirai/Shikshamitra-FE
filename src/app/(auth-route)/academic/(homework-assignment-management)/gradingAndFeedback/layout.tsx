'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const GradingFeedbackLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.homework.assessment}>
    {children}
  </StudentPermissionGuard>
);

export default GradingFeedbackLayout;
