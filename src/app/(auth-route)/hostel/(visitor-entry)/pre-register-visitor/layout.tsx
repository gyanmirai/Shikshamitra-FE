'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelPreRegisterLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.visitor.preRegister}>
    {children}
  </StudentPermissionGuard>
);

export default HostelPreRegisterLayout;
