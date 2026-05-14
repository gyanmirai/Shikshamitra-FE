'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelFeeSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.feeManagement.setting}>
    {children}
  </StudentPermissionGuard>
);

export default HostelFeeSettingLayout;
