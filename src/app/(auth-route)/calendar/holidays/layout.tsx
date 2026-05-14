'use client';

import { calendarPermissions } from 'src/constants/calendar-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CalendarHolidaysLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={calendarPermissions.holidays}>
    {children}
  </StudentPermissionGuard>
);

export default CalendarHolidaysLayout;
