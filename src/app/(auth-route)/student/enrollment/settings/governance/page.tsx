import { studentPaths } from 'src/constants/student-menu';
import {
  redirectEnrollmentRoute,
  type EnrollmentRouteSearchParams,
} from 'src/routes/enrollment-redirect';

export default async function LegacyGovernanceSettingsPage({
  searchParams,
}: {
  searchParams: EnrollmentRouteSearchParams;
}) {
  return redirectEnrollmentRoute(studentPaths.enrollment.settings, searchParams);
}
