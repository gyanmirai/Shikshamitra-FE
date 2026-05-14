'use client';

import { transportPermissions } from 'src/constants/transport-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const TransportNotificationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.notification}>
    {children}
  </StudentPermissionGuard>
);

export default TransportNotificationLayout;
