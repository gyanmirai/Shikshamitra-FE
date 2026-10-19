'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const PaymentTermLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.fees.settings.paymentTerms}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default PaymentTermLayout;
