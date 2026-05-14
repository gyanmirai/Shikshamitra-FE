'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const GradeEntryLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.examination.recordMarks}>
    {children}
  </StudentPermissionGuard>
);

export default GradeEntryLayout;
