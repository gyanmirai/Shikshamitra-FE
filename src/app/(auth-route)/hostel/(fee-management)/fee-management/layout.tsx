'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelFeeCollectionLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.feeManagement.collection}>
    {children}
  </StudentPermissionGuard>
);

export default HostelFeeCollectionLayout;
