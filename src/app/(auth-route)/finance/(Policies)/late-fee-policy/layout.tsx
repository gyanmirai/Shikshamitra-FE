'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LateFeePolicyLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.collections}>
    {children}
  </StudentPermissionGuard>
);

export default LateFeePolicyLayout;
