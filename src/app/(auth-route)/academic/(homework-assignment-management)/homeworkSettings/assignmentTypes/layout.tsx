'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const AssignmentTypesLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.homework.settings.assignmentTypes}>
    {children}
  </StudentPermissionGuard>
);

export default AssignmentTypesLayout;
