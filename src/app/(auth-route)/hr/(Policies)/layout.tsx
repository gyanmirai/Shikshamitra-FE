'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const PoliciesGroupLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.policies.root}>
    {children}
  </StudentPermissionGuard>
);

export default PoliciesGroupLayout;
