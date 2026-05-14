'use client';

import { communicationPermissions } from 'src/constants/comminication-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const NotificationTemplatesLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={communicationPermissions.notification.templates}>
    {children}
  </StudentPermissionGuard>
);

export default NotificationTemplatesLayout;
