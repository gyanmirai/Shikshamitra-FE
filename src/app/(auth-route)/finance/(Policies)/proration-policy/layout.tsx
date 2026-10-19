'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const ProrationPolicyLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.policies.prorationPolicy}>
    {children}
  </ExactPermissionGuard>
);

export default ProrationPolicyLayout;
