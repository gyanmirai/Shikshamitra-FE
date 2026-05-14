'use client';

import { transportPermissions } from 'src/constants/transport-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const StopManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.stopManagement}>
    {children}
  </StudentPermissionGuard>
);

export default StopManagementLayout;
