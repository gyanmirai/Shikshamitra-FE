'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const EmployeeListLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.employee.list}>
    {children}
  </StudentPermissionGuard>
);

export default EmployeeListLayout;
