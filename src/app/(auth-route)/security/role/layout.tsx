'use client';

import { securityPermissions } from 'src/constants/security-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const RoleManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityPermissions.roleAndPermission.role}>
    {children}
  </StudentPermissionGuard>
);

export default RoleManagementLayout;
