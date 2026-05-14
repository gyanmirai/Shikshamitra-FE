'use client';

import { calendarPermissions } from 'src/constants/calendar-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CalendarDashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={calendarPermissions.dashboard}>
    {children}
  </StudentPermissionGuard>
);

export default CalendarDashboardLayout;
