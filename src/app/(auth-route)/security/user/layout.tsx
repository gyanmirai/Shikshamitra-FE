'use client';

import { securityPermissions } from 'src/constants/security-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const UserManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={securityPermissions.roleAndPermission.userManagement}>
    {children}
  </StudentPermissionGuard>
);

export default UserManagementLayout;
