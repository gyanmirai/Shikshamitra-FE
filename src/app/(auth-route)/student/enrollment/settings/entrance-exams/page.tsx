import { studentPaths } from 'src/constants/student-menu';
import {
  redirectEnrollmentRoute,
  type EnrollmentRouteSearchParams,
} from 'src/routes/enrollment-redirect';

export default async function LegacyEntranceExamSettingsPage({
  searchParams,
}: {
  searchParams: EnrollmentRouteSearchParams;
}) {
  return redirectEnrollmentRoute(
    studentPaths.enrollment.settingsSections.entranceExam,
    searchParams
  );
}
