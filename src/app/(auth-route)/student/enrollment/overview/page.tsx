import { studentPaths } from 'src/constants/student-menu';
import {
  redirectEnrollmentRoute,
  type EnrollmentRouteSearchParams,
} from 'src/routes/enrollment-redirect';

const EnrollmentOverviewPage = async ({
  searchParams,
}: {
  searchParams: EnrollmentRouteSearchParams;
}) => redirectEnrollmentRoute(studentPaths.enrollment.myWork, searchParams);

export default EnrollmentOverviewPage;
