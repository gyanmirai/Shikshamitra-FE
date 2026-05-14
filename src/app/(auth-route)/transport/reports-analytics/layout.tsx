'use client';

import { transportPermissions } from 'src/constants/transport-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const TransportReportsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.reports}>
    {children}
  </StudentPermissionGuard>
);

export default TransportReportsLayout;
