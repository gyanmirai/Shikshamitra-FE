'use client';

import { instituteSetupPermissions } from 'src/constants/institute-setup';
import StudentPermissionGuard from 'src/components/student-permission-guard';

export default function InstituteReportsLayout({ children }: { children: React.ReactNode }) {
  return <StudentPermissionGuard permissionKey={instituteSetupPermissions.reports}>{children}</StudentPermissionGuard>;
}
