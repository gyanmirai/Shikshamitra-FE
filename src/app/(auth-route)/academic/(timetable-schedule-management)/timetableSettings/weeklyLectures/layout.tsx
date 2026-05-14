'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const WeeklyLecturesLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.timetable.settings.weeklyLectures}>
    {children}
  </StudentPermissionGuard>
);

export default WeeklyLecturesLayout;
