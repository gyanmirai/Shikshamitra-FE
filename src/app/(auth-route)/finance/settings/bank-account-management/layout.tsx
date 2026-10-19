'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const BankAccountLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.accounts.settings.bankAccount}>
    {children}
  </ExactPermissionGuard>
);

export default BankAccountLayout;
