'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ReconciliationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.accounts.reconciliation}>
    {children}
  </StudentPermissionGuard>
);

export default ReconciliationLayout;
