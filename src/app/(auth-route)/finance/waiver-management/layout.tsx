'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

export default function WaiverManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentPermissionGuard permissionKey={financePermissions.fees.waiverActions.view}>
      {children}
    </StudentPermissionGuard>
  );
}
