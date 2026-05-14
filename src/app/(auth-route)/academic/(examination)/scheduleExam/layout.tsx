'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ScheduleExamLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.examination.schedule}>
    {children}
  </StudentPermissionGuard>
);

export default ScheduleExamLayout;
