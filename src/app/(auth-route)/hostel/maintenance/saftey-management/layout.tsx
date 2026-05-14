'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelSafetyLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.maintenance.safety}>
    {children}
  </StudentPermissionGuard>
);

export default HostelSafetyLayout;
