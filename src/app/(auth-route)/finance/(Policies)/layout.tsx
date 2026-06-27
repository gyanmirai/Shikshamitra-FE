'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const FinancePoliciesGroupLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.root}>
    {children}
  </StudentPermissionGuard>
);

export default FinancePoliciesGroupLayout;
