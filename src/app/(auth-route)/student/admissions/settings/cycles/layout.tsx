import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.enrollment.settings.cycles}>
      {children}
    </StudentPermissionGuard>
  );
}
