'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ProcurementVendorsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.procurement.root}>
    {children}
  </StudentPermissionGuard>
);

export default ProcurementVendorsLayout;
