'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LeavePoliciesLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.policies.leavePolicies}>
    {children}
  </StudentPermissionGuard>
);

export default LeavePoliciesLayout;
