'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const FeeStructureLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.settings.feeStructure}>
    {children}
  </StudentPermissionGuard>
);

export default FeeStructureLayout;
