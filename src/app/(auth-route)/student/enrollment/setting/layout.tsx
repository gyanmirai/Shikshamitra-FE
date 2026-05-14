'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const EnrollmentSettingLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.settings.root}>
    {children}
  </StudentPermissionGuard>
);

export default EnrollmentSettingLayout;
