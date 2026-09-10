'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

export default function AccountHeadLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentPermissionGuard permissionKey={financePermissions.accounts.settings.accountHead}>
      {children}
    </StudentPermissionGuard>
  );
}
