'use client';

import { communicationPermissions } from 'src/constants/comminication-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const NotificationHistoryLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={communicationPermissions.history}>
    {children}
  </StudentPermissionGuard>
);

export default NotificationHistoryLayout;
