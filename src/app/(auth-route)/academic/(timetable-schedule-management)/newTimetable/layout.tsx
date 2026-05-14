'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const NewTimetableLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.timetable.management}>
    {children}
  </StudentPermissionGuard>
);

export default NewTimetableLayout;
