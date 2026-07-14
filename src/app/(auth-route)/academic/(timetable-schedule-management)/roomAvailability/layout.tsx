'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const RoomAvailabilityLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.timetable.roomAvailability}>
    {children}
  </StudentPermissionGuard>
);

export default RoomAvailabilityLayout;
