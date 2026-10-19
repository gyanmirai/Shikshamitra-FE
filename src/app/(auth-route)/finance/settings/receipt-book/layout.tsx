'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const ReceiptBookLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.fees.settings.receiptBook}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default ReceiptBookLayout;
