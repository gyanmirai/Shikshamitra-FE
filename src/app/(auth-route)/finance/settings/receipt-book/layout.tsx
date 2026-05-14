'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ReceiptBookLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.settings.receiptBook}>
    {children}
  </StudentPermissionGuard>
);

export default ReceiptBookLayout;
