import { studentPaths } from 'src/constants/student-menu';
import {
  redirectEnrollmentRoute,
  type EnrollmentRouteSearchParams,
} from 'src/routes/enrollment-redirect';

const AdmissionsAnalyticsPage = async ({
  searchParams,
}: {
  searchParams: EnrollmentRouteSearchParams;
}) => redirectEnrollmentRoute(studentPaths.enrollment.reports, searchParams);

export default AdmissionsAnalyticsPage;
