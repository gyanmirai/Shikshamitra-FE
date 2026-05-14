'use client';

import { academicPermissions } from 'src/constants/academic-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ReportsAnalyticsLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={academicPermissions.lms.reports}>
    {children}
  </StudentPermissionGuard>
);

export default ReportsAnalyticsLayout;
