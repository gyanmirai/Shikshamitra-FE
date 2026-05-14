'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelLogVisitorLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.visitor.log}>
    {children}
  </StudentPermissionGuard>
);

export default HostelLogVisitorLayout;
