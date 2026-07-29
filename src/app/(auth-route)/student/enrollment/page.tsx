import { studentPaths } from 'src/constants/student-menu';
import {
  redirectEnrollmentRoute,
  type EnrollmentRouteSearchParams,
} from 'src/routes/enrollment-redirect';

const EnrollmentPage = async ({ searchParams }: { searchParams: EnrollmentRouteSearchParams }) =>
  redirectEnrollmentRoute(studentPaths.enrollment.myWork, searchParams);

export default EnrollmentPage;
