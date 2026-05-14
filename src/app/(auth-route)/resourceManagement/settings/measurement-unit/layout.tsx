'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const MeasurementUnitLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.settings.measurementUnit}>
    {children}
  </StudentPermissionGuard>
);

export default MeasurementUnitLayout;
