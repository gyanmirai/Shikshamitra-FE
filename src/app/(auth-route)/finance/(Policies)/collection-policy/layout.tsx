'use client';

import { financePermissions } from 'src/constants/finance-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CollectionPolicyLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={financePermissions.policies.collectionPolicy}>
    {children}
  </StudentPermissionGuard>
);

export default CollectionPolicyLayout;
