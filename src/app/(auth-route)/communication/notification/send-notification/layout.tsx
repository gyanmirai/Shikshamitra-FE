'use client';

import { communicationPermissions } from 'src/constants/comminication-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const SendNotificationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={communicationPermissions.notification.sent}>
    {children}
  </StudentPermissionGuard>
);

export default SendNotificationLayout;
