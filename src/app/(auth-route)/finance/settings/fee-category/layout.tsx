'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const FeeCategoryLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.fees.settings.feeCategory}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default FeeCategoryLayout;
