'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const FeeRefundLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.fees.refundActions.view}>
    {children}
  </ExactPermissionGuard>
);

export default FeeRefundLayout;
