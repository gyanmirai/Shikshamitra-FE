'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const BankAccountLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.accounts.settings.bankAccount}>
    {children}
  </StudentPermissionGuard>
);

export default BankAccountLayout;
