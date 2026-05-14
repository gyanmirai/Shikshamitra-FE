'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LmsCourseManagementSettingsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.lms.settings.courseManagement}>
    {children}
  </StudentPermissionGuard>
);

export default LmsCourseManagementSettingsLayout;
