'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const FinanceSettingsLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.root}>
    {children}
  </ExactPermissionGuard>
);

export default FinanceSettingsLayout;
