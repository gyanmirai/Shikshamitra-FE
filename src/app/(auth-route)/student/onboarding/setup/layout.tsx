import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';

export default function StudentOnboardingSetupLayout({ children }: { children: ReactNode }) {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.onboarding.setup}>
      {children}
    </StudentPermissionGuard>
  );
}
