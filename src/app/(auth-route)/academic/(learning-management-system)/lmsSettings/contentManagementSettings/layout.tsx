'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LmsContentManagementSettingsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.lms.settings.contentManagement}>
    {children}
  </StudentPermissionGuard>
);

export default LmsContentManagementSettingsLayout;
