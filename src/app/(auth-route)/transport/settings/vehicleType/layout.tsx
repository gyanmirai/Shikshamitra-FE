'use client';

import { transportPermissions } from 'src/constants/transport-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const VehicleTypeLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.settings.vehicleType}>
    {children}
  </StudentPermissionGuard>
);

export default VehicleTypeLayout;
