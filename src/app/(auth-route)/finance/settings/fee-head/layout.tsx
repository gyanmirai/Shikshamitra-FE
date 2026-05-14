'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const FeeHeadLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.settings.feeHead}>
    {children}
  </StudentPermissionGuard>
);

export default FeeHeadLayout;
