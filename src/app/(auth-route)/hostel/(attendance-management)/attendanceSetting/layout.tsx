'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelAttendanceSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.attendance.setting}>
    {children}
  </StudentPermissionGuard>
);

export default HostelAttendanceSettingLayout;
