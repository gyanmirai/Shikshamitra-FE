'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const FinanceNotificationLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.notification}>
    {children}
  </ExactPermissionGuard>
);

export default FinanceNotificationLayout;
