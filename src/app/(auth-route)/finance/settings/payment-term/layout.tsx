'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const PaymentTermLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.settings.paymentTerms}>
    {children}
  </StudentPermissionGuard>
);

export default PaymentTermLayout;
