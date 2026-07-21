'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const RefundPolicyLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.policies.refundPolicy}>
    {children}
  </StudentPermissionGuard>
);

export default RefundPolicyLayout;
