import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const EnrollmentSettingLayout = ({ children }: { children: ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.settings.root}>
    {children}
  </StudentPermissionGuard>
);

export default EnrollmentSettingLayout;
