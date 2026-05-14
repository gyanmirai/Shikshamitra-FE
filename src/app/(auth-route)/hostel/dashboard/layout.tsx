'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelDashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.dashboard}>
    {children}
  </StudentPermissionGuard>
);

export default HostelDashboardLayout;
