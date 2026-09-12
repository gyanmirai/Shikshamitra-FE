import type { ReactNode } from 'react';

import { studentPermissions } from 'src/constants/student-menu';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import StudentOnboardingShell from 'src/screens/student/onboarding/student-onboarding-shell';
import { OnboardingSettingsProvider } from 'src/screens/student/onboarding/onboarding-settings-context';

export default function StudentOnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <StudentPermissionGuard permissionKey={studentPermissions.onboarding.root}>
      <OnboardingSettingsProvider>
        <StudentOnboardingShell>{children}</StudentOnboardingShell>
      </OnboardingSettingsProvider>
    </StudentPermissionGuard>
  );
}
