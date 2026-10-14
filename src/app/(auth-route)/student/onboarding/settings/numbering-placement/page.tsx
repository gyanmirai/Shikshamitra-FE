import { redirect } from 'next/navigation';

import { studentPaths } from 'src/constants/student-menu';

export default async function StudentOnboardingNumberingPlacementSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const params = await searchParams;
  redirect(
    params.tab === 'roll-number'
      ? studentPaths.onboarding.settingsSections.rollNumber
      : studentPaths.onboarding.settingsSections.grNumber
  );
}
