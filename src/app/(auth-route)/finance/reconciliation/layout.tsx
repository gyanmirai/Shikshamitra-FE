'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const ReconciliationLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.accounts.reconciliation}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default ReconciliationLayout;
