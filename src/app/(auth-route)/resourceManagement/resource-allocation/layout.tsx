'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ResourceAllocationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.allocation.root}>
    {children}
  </StudentPermissionGuard>
);

export default ResourceAllocationLayout;
