'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const PaymentPolicyLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.policies.paymentPolicy}>
    {children}
  </StudentPermissionGuard>
);

export default PaymentPolicyLayout;
