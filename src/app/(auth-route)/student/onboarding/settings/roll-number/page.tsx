import { redirect } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';

export default function StudentOnboardingRollNumberSettingsPage() {
  redirect(`${studentPaths.onboarding.settingsSections.numberingPlacement}?tab=roll-number`);
}
