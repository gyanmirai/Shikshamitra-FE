'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const FeeCategoryLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.settings.feeCategory}>
    {children}
  </StudentPermissionGuard>
);

export default FeeCategoryLayout;
