'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ChargeCategoryLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.settings.chargeCategory}>
    {children}
  </StudentPermissionGuard>
);

export default ChargeCategoryLayout;
