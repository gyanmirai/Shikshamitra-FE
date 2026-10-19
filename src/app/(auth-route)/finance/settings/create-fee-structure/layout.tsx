'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const FeeStructureLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.fees.settings.feeStructureActions.view}>
    {children}
  </ExactPermissionGuard>
);

export default FeeStructureLayout;
