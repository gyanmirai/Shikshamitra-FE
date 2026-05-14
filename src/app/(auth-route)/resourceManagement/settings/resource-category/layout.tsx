'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ResourceCategoryLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.settings.category}>
    {children}
  </StudentPermissionGuard>
);

export default ResourceCategoryLayout;
