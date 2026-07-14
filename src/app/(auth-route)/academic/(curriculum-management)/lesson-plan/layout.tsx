'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LessonPlanLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.curriculum.lessonPlan}>
    {children}
  </StudentPermissionGuard>
);

export default LessonPlanLayout;
