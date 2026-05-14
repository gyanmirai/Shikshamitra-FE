'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const RoomAllocationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.roomAllocation}>
    {children}
  </StudentPermissionGuard>
);

export default RoomAllocationLayout;
