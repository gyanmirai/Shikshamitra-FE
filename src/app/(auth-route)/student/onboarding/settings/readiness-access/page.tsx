import { redirect } from 'next/navigation';

import { studentPaths } from 'src/constants/student-menu';

export default function StudentOnboardingReadinessAccessSettingsPage() {
  redirect(studentPaths.onboarding.settingsSections.portalAccess);
}
