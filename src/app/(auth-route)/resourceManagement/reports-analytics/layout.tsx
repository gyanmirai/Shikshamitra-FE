'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ResourceReportsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.reports}>
    {children}
  </StudentPermissionGuard>
);

export default ResourceReportsLayout;
