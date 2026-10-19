'use client';

import { financePermissions } from 'src/constants/finance-menu';
import ExactPermissionGuard from 'src/components/exact-permission-guard';

const CollectionPolicyLayout = ({ children }: { children: React.ReactNode }) => (
  <ExactPermissionGuard permissionKey={financePermissions.policies.collectionPolicy}>
    {children}
  </ExactPermissionGuard>
);

export default CollectionPolicyLayout;
