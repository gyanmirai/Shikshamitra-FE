'use client';

import { classManagementPermissions } from 'src/constants/class-management';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ClassMgmtNotificationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={classManagementPermissions.notification}>
    {children}
  </StudentPermissionGuard>
);

export default ClassMgmtNotificationLayout;
