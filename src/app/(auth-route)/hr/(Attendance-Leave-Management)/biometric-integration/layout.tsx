'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const BiometricIntegrationLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.attendance.biometricAttendance}>
    {children}
  </StudentPermissionGuard>
);

export default BiometricIntegrationLayout;
