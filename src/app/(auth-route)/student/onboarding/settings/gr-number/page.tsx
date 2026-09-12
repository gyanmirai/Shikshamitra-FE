import { redirect } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';

export default function StudentOnboardingGrNumberSettingsPage() {
  redirect(`${studentPaths.onboarding.settingsSections.numberingPlacement}?tab=gr-number`);
}
