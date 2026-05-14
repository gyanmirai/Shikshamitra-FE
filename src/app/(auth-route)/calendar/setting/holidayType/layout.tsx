'use client';

import { calendarPermissions } from 'src/constants/calendar-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HolidayTypeLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={calendarPermissions.settings.holidayType}>
    {children}
  </StudentPermissionGuard>
);

export default HolidayTypeLayout;
