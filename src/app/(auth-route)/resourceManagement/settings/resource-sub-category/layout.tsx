'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ResourceSubCategoryLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.settings.subCategory}>
    {children}
  </StudentPermissionGuard>
);

export default ResourceSubCategoryLayout;
