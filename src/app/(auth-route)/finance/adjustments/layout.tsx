'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AdjustmentLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.adjustment}>
    {children}
  </StudentPermissionGuard>
);

export default AdjustmentLayout;
