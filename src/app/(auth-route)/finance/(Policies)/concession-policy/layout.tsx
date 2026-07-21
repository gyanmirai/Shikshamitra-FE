'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ConcessionPolicyLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.policies.concessionPolicy}>
    {children}
  </StudentPermissionGuard>
);

export default ConcessionPolicyLayout;
