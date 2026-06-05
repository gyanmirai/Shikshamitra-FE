'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CalendarsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.policies.calendars}>
    {children}
  </StudentPermissionGuard>
);

export default CalendarsLayout;
