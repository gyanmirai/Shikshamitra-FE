'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const FeeStructureAssignLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.fees.structureAssign}>
    {children}
  </StudentPermissionGuard>
);

export default FeeStructureAssignLayout;
