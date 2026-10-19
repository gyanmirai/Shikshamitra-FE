'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const ConcessionTypeLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.fees.settings.concessionType}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default ConcessionTypeLayout;
