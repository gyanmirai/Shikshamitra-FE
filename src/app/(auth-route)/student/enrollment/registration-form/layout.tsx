'use client';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const RegistrationFormLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={studentPermissions.enrollment.registrationFormIssued}>
    {children}
  </StudentPermissionGuard>
);

export default RegistrationFormLayout;
