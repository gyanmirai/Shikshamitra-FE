'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const ConcessionLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.fees.concessions}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default ConcessionLayout;
