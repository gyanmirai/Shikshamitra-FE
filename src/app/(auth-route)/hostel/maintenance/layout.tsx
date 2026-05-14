'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelMaintenanceLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.maintenance.root}>
    {children}
  </StudentPermissionGuard>
);

export default HostelMaintenanceLayout;
