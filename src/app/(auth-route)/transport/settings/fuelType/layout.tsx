'use client';

import { transportPermissions } from 'src/constants/transport-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const FuelTypeLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.settings.fuelType}>
    {children}
  </StudentPermissionGuard>
);

export default FuelTypeLayout;
