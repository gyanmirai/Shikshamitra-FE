'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LmsSettingsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.lms.settings.root}>
    {children}
  </StudentPermissionGuard>
);

export default LmsSettingsLayout;
