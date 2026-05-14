'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const DisposedResourceLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.disposed}>
    {children}
  </StudentPermissionGuard>
);

export default DisposedResourceLayout;
