'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const InventoryMgmtLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.inventory}>
    {children}
  </StudentPermissionGuard>
);

export default InventoryMgmtLayout;
