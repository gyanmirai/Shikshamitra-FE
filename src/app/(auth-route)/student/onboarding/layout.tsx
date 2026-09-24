import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import StudentOnboardingShell from 'src/screens/student/onboarding/student-onboarding-shell';
import { PersistedOnboardingSettingsProvider } from 'src/screens/student/onboarding/persisted-onboarding-settings-provider';

export default function StudentOnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.onboarding.root}>
      <PersistedOnboardingSettingsProvider>
        <StudentOnboardingShell>{children}</StudentOnboardingShell>
      </PersistedOnboardingSettingsProvider>
    </StudentPermissionGuard>
  );
}
