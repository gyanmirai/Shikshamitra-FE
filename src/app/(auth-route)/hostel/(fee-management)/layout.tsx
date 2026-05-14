'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelFeeGroupLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.feeManagement.root}>
    {children}
  </StudentPermissionGuard>
);

export default HostelFeeGroupLayout;
