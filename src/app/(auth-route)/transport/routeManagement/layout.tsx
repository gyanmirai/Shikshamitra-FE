'use client';

import { transportPermissions } from 'src/constants/transport-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const RouteManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.routeManagement}>
    {children}
  </StudentPermissionGuard>
);

export default RouteManagementLayout;
