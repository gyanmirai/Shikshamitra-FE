'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const TimetableReportsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.timetable.reports}>
    {children}
  </StudentPermissionGuard>
);

export default TimetableReportsLayout;
