'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const RefundPolicyLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.policies.refundPolicy}>
    {children}
  </ExactPermissionGuard>
);

export default RefundPolicyLayout;
