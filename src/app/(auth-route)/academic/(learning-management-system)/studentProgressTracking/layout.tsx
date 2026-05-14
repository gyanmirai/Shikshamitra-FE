'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const StudentProgressTrackingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.lms.studentProgress}>
    {children}
  </StudentPermissionGuard>
);

export default StudentProgressTrackingLayout;
