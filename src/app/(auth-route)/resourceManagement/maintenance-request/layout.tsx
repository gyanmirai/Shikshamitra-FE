'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const MaintenanceRequestLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.maintenanceRequest}>
    {children}
  </StudentPermissionGuard>
);

export default MaintenanceRequestLayout;
