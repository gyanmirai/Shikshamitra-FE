'use client';

import { calendarPermissions } from 'src/constants/calendar-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CalendarGroupMgmtLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={calendarPermissions.groupManagement}>
    {children}
  </StudentPermissionGuard>
);

export default CalendarGroupMgmtLayout;
