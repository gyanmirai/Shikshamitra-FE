'use client';

import { calendarPermissions } from 'src/constants/calendar-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CalendarViewLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={calendarPermissions.view}>
    {children}
  </StudentPermissionGuard>
);

export default CalendarViewLayout;
