'use client';

import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import { EnrollmentSettingsShell } from 'src/screens/student/enrollment/setting/enrollment-settings-shell';

export default function EnrollmentSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.enrollment.settings}>
      <EnrollmentSettingsShell>{children}</EnrollmentSettingsShell>
    </StudentPermissionGuard>
  );
}
