import { redirect } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';

export default function StudentOnboardingOperationalPoliciesPage() {
  redirect(studentPaths.onboarding.settingsSections.readinessAccess);
}
