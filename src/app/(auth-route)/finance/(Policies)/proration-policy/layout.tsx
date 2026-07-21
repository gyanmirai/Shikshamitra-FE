'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ProrationPolicyLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.policies.prorationPolicy}>
    {children}
  </StudentPermissionGuard>
);

export default ProrationPolicyLayout;
