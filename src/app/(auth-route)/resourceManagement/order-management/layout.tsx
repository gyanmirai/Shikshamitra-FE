'use client';

import { resourcePermissions } from 'src/constants/resource-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const OrderRequestLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={resourcePermissions.orderRequest}>
    {children}
  </StudentPermissionGuard>
);

export default OrderRequestLayout;
