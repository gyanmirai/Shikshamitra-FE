import { studentPaths } from 'src/constants/student-menu';
import {
  redirectEnrollmentRoute,
  type EnrollmentRouteSearchParams,
} from 'src/routes/enrollment-redirect';

const AdmissionsOperationsPage = async ({
  searchParams,
}: {
  searchParams: EnrollmentRouteSearchParams;
}) => redirectEnrollmentRoute(studentPaths.enrollment.followUpsMessages, searchParams);

export default AdmissionsOperationsPage;
