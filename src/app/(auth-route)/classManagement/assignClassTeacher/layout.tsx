'use client';

import { classManagementPermissions } from 'src/constants/class-management';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ClassTeacherAssignmentLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={classManagementPermissions.classTeacherAssignment}>
    {children}
  </StudentPermissionGuard>
);

export default ClassTeacherAssignmentLayout;
