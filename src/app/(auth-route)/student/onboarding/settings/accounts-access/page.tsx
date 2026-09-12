import { redirect } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';

export default function AccountsAccessSettingsPage() {
  redirect(`${studentPaths.onboarding.settingsSections.readinessAccess}#accounts-access`);
}
