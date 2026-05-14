'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const FeeRefundLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.feeRefund}>
    {children}
  </StudentPermissionGuard>
);

export default FeeRefundLayout;
