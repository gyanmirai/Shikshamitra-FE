'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const InvoiceReceiptLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.fees.invoicesAndReceipts}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default InvoiceReceiptLayout;
