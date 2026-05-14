'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LectureSlotsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.timetable.settings.lectureSlots}>
    {children}
  </StudentPermissionGuard>
);

export default LectureSlotsLayout;
