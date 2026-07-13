import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import EnrollmentShell from 'src/screens/student/enrollment/enrollment-shell';

const EnrollmentLayout = ({ children }: { children: ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.root}>
    <EnrollmentShell>{children}</EnrollmentShell>
  </StudentPermissionGuard>
);

export default EnrollmentLayout;
