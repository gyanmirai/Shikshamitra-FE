'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const MyResourcesRequestLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.myQuery}>
    {children}
  </StudentPermissionGuard>
);

export default MyResourcesRequestLayout;
