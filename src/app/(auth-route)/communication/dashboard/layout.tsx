'use client';

import { communicationPermissions } from 'src/constants/comminication-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const CommDashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={communicationPermissions.dashboard}>
    {children}
  </StudentPermissionGuard>
);

export default CommDashboardLayout;
