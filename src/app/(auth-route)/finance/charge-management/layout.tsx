'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ChargeManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.charges}>
    {children}
  </StudentPermissionGuard>
);

export default ChargeManagementLayout;
