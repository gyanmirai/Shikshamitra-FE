import { redirect } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';

export default function StudentOnboardingPage() {
  redirect(studentPaths.onboarding.setup);
}
