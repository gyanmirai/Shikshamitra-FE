import { redirect } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';

export default function OnboardingRulesSettingsPage() {
  redirect(studentPaths.onboarding.settingsSections.portalAccess);
}
