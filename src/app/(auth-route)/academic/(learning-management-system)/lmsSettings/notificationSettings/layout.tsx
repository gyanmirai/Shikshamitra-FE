'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const LmsNotificationSettingsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.lms.settings.notification}>
    {children}
  </StudentPermissionGuard>
);

export default LmsNotificationSettingsLayout;
