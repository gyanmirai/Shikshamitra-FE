'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelLeaveApproveLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.attendance.leaveApprove}>
    {children}
  </StudentPermissionGuard>
);

export default HostelLeaveApproveLayout;
