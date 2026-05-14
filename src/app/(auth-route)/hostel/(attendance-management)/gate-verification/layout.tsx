'use client';

import { hostelPermissions } from 'src/constants/hostel-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const HostelGateVerificationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hostelPermissions.attendance.gateVerification}>
    {children}
  </StudentPermissionGuard>
);

export default HostelGateVerificationLayout;
