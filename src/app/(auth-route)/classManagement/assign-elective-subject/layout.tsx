'use client';

import { classManagementPermissions } from 'src/constants/class-management';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ElectiveAssignmentLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={classManagementPermissions.electiveAssignment}>
    {children}
  </StudentPermissionGuard>
);

export default ElectiveAssignmentLayout;
