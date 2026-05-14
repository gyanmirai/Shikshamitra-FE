'use client';

import { calendarPermissions } from 'src/constants/calendar-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CalendarEventsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={calendarPermissions.events}>
    {children}
  </StudentPermissionGuard>
);

export default CalendarEventsLayout;
