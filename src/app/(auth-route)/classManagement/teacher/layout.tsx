'use client';

import { classManagementPermissions } from 'src/constants/class-management';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const TeacherAssignmentLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={classManagementPermissions.teacherAssignment}>
    {children}
  </StudentPermissionGuard>
);

export default TeacherAssignmentLayout;
