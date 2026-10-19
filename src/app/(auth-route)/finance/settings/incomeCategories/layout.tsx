'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const IncomeCategoryLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.accounts.settings.incomeCategory}>
    {children}
  </ExactPermissionGuard>
);

export default IncomeCategoryLayout;
