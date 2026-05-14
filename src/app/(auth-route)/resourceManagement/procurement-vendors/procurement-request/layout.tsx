'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ProcurementRequestLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.procurement.request}>
    {children}
  </StudentPermissionGuard>
);

export default ProcurementRequestLayout;
