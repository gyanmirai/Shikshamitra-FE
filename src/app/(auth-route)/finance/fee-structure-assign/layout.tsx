'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const FeeStructureAssignLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={`${financePermissions.fees.structureAssign}.View`}>
    {children}
  </ExactPermissionGuard>
);

export default FeeStructureAssignLayout;
