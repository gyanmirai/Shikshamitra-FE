'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelMaintenanceSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.maintenance.setting}>
    {children}
  </StudentPermissionGuard>
);

export default HostelMaintenanceSettingLayout;
