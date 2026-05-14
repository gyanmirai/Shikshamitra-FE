'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LmsGeneralSettingsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.lms.settings.general}>
    {children}
  </StudentPermissionGuard>
);

export default LmsGeneralSettingsLayout;
