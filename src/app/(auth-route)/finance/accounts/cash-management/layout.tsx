'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

export default function CashLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExactPermissionGuard permissionKey={`${financePermissions.accounts.cashManagement}.View`}>
      {children}
    </ExactPermissionGuard>
  );
}
