'use client';

import { transportPermissions } from 'src/constants/transport-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ApplicationManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.applicationManagement}>
    {children}
  </StudentPermissionGuard>
);

export default ApplicationManagementLayout;
