'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelCateringSettingsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.catering.settings}>
    {children}
  </StudentPermissionGuard>
);

export default HostelCateringSettingsLayout;
