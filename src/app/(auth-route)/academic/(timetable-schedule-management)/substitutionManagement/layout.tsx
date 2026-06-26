'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const SubstitutionManagementLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.timetable.substitutionManagement}>
    {children}
  </StudentPermissionGuard>
);

export default SubstitutionManagementLayout;
