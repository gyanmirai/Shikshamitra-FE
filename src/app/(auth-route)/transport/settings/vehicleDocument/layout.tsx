'use client';

import { transportPermissions } from 'src/constants/transport-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const VehicleDocumentLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.settings.vehicleDocument}>
    {children}
  </StudentPermissionGuard>
);

export default VehicleDocumentLayout;
