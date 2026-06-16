import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const EnrollmentLayout = ({ children }: { children: ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.root}>
    {children}
  </StudentPermissionGuard>
);

export default EnrollmentLayout;
