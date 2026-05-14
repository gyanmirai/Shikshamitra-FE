'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ManageProcurementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.procurement.review}>
    {children}
  </StudentPermissionGuard>
);

export default ManageProcurementLayout;
