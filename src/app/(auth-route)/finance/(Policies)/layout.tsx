'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const FinancePoliciesGroupLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.policies.root}>
    {children}
  </ExactPermissionGuard>
);

export default FinancePoliciesGroupLayout;
