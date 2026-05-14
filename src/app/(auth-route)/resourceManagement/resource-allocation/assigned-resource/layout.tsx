'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AssignedResourceLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.allocation.assigned}>
    {children}
  </StudentPermissionGuard>
);

export default AssignedResourceLayout;
