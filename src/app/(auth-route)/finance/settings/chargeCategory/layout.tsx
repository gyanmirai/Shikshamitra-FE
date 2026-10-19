'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const ChargeCategoryLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.fees.settings.chargeCategory}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default ChargeCategoryLayout;
