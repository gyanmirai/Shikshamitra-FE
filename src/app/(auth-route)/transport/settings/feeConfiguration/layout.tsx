'use client';

import { transportPermissions } from 'src/constants/transport-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const FeeConfigurationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={transportPermissions.settings.feeConfiguration}>
    {children}
  </StudentPermissionGuard>
);

export default FeeConfigurationLayout;
