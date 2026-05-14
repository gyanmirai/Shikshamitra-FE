'use client';

import { transportPermissions } from 'src/constants/transport-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const VehicleManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.vehicleManagement}>
    {children}
  </StudentPermissionGuard>
);

export default VehicleManagementLayout;
